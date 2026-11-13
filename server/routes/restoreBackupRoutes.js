const express = require("express");
const multer = require("multer");
const AdmZip = require("adm-zip");
const mongoose = require("mongoose");
const { BSON, EJSON } = require("bson");
const crypto = require("crypto");
const path = require("path");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const EXPECTED_DATABASE = "skillsync";
const EXPECTED_COLLECTIONS = [
  "users",
  "mentorapplications",
  "requests",
  "conversations",
  "messages",
  "notifications",
  "skills",
  "tests",
  "testattempts",
  "reviews",
  "sessions",
  "transactions",
];

function tokenIsValid(received) {
  const expected = process.env.DB_RESTORE_TOKEN || "";
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function decodeBsonFile(buffer, collectionName) {
  const documents = [];
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 4 > buffer.length) {
      throw new Error(`Invalid BSON length header in ${collectionName}.bson`);
    }

    const documentLength = buffer.readInt32LE(offset);
    if (
      documentLength < 5 ||
      offset + documentLength > buffer.length
    ) {
      throw new Error(`Invalid BSON document in ${collectionName}.bson`);
    }

    const document = BSON.deserialize(
      buffer.subarray(offset, offset + documentLength)
    );

    if (!document || document._id === undefined) {
      throw new Error(`Document without _id found in ${collectionName}.bson`);
    }

    documents.push(document);
    offset += documentLength;
  }

  return documents;
}

function indexOptionsFromMetadata(index) {
  const options = { name: index.name };
  const allowed = [
    "unique",
    "sparse",
    "expireAfterSeconds",
    "partialFilterExpression",
    "collation",
    "wildcardProjection",
    "weights",
    "default_language",
    "language_override",
    "textIndexVersion",
    "2dsphereIndexVersion",
    "bits",
    "min",
    "max",
    "bucketSize",
  ];

  for (const key of allowed) {
    if (index[key] !== undefined) options[key] = index[key];
  }
  return options;
}

async function ensureCollection(db, collectionName, metadata) {
  const exists = await db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .hasNext();

  if (!exists) {
    await db.createCollection(collectionName, metadata.options || {});
  }

  return db.collection(collectionName);
}

router.get("/", (req, res) => {
  if (!process.env.DB_RESTORE_TOKEN) {
    return res.status(404).send("Database restore is disabled.");
  }
  return res.sendFile(path.join(__dirname, "restoreBackup.html"));
});

router.post(
  "/",
  (req, res, next) => {
    if (!tokenIsValid(req.get("x-restore-token"))) {
      return res.status(401).json({ success: false, message: "Invalid restore token." });
    }
    next();
  },
  (req, res, next) => {
    upload.single("backup")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.code === "LIMIT_FILE_SIZE"
            ? "Backup ZIP is larger than 5 MB."
            : error.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Choose the skillsync_final.zip backup first." });
      }

      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        return res.status(503).json({ success: false, message: "Backend database connection is not ready." });
      }

      const db = mongoose.connection.db;
      if (db.databaseName !== EXPECTED_DATABASE) {
        return res.status(409).json({
          success: false,
          message: `Safety stop: backend is connected to '${db.databaseName}', not '${EXPECTED_DATABASE}'. No data was imported.`,
        });
      }

      const zip = new AdmZip(req.file.buffer);
      const files = new Map();
      const entries = zip.getEntries();
      if (entries.length > 40) {
        throw new Error("Backup ZIP has too many entries; expected the SkillSync BSON dump only.");
      }
      let totalUncompressedBytes = 0;
      for (const entry of entries) {
        if (entry.isDirectory) continue;
        const entrySize = Number(entry.header && entry.header.size) || 0;
        totalUncompressedBytes += entrySize;
        if (entrySize > 5 * 1024 * 1024 || totalUncompressedBytes > 20 * 1024 * 1024) {
          throw new Error("Backup ZIP expands beyond the allowed 20 MB limit.");
        }
        const normalizedName = entry.entryName.replace(/\\/g, "/");
        const basename = normalizedName.split("/").pop();
        if (basename) files.set(basename, entry.getData());
      }

      for (const collectionName of EXPECTED_COLLECTIONS) {
        if (!files.has(`${collectionName}.bson`)) {
          throw new Error(`Backup is missing ${collectionName}.bson. No collections were imported.`);
        }
        if (!files.has(`${collectionName}.metadata.json`)) {
          throw new Error(`Backup is missing ${collectionName}.metadata.json. No collections were imported.`);
        }
      }

      // Parse and validate every collection before writing anything, so a malformed
      // BSON file cannot leave a half-restored database.
      const preparedCollections = EXPECTED_COLLECTIONS.map((collectionName) => ({
        collectionName,
        metadata: EJSON.parse(
          files.get(`${collectionName}.metadata.json`).toString("utf8")
        ),
        documents: decodeBsonFile(
          files.get(`${collectionName}.bson`),
          collectionName
        ),
      }));

      const summary = [];
      for (const prepared of preparedCollections) {
        const { collectionName, metadata, documents } = prepared;
        const collection = await ensureCollection(db, collectionName, metadata);

        let upserted = 0;
        let matched = 0;
        let modified = 0;
        const conflicts = [];

        for (const document of documents) {
          try {
            const result = await collection.replaceOne(
              { _id: document._id },
              document,
              { upsert: true }
            );
            upserted += result.upsertedCount || 0;
            matched += result.matchedCount || 0;
            modified += result.modifiedCount || 0;
          } catch (error) {
            conflicts.push({
              id: String(document._id),
              code: error.code || "IMPORT_ERROR",
              message: error.code === 11000
                ? "Duplicate unique value already exists in the target database."
                : error.message,
            });
          }
        }

        let indexesCreated = 0;
        for (const index of metadata.indexes || []) {
          if (!index.name || index.name === "_id_" || !index.key) continue;
          try {
            await collection.createIndex(index.key, indexOptionsFromMetadata(index));
            indexesCreated += 1;
          } catch (error) {
            if (error.codeName !== "IndexOptionsConflict" && error.code !== 85 && error.code !== 86) {
              conflicts.push({
                id: index.name,
                code: error.code || "INDEX_ERROR",
                message: error.message,
              });
            }
          }
        }

        summary.push({
          collection: collectionName,
          backupDocuments: documents.length,
          inserted: upserted,
          alreadyPresent: matched,
          modified,
          indexesCreated,
          conflicts,
        });
      }

      return res.status(200).json({
        success: true,
        database: db.databaseName,
        message: "Restore pass completed. Review per-collection conflicts and verify counts in Atlas before using the app.",
        collections: summary,
        totalBackupDocuments: summary.reduce((sum, item) => sum + item.backupDocuments, 0),
        totalInserted: summary.reduce((sum, item) => sum + item.inserted, 0),
        totalConflicts: summary.reduce((sum, item) => sum + item.conflicts.length, 0),
      });
    } catch (error) {
      console.error("[one-time database restore]", error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
