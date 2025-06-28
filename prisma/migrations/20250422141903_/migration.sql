-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FieldValue" (
    "value" TEXT NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "submissionId" INTEGER NOT NULL,

    PRIMARY KEY ("fieldId", "submissionId"),
    CONSTRAINT "FieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FieldValue_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FieldValue" ("fieldId", "submissionId", "value") SELECT "fieldId", "submissionId", "value" FROM "FieldValue";
DROP TABLE "FieldValue";
ALTER TABLE "new_FieldValue" RENAME TO "FieldValue";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
