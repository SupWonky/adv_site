/*
  Warnings:

  - A unique constraint covering the columns `[uri]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_uri_key" ON "File"("uri");

-- CreateIndex
CREATE INDEX "File_uri_idx" ON "File"("uri");
