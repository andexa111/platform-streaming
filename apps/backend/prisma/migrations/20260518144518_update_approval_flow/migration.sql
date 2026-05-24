/*
  Warnings:

  - You are about to drop the column `plan` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `planId` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SubStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "films" ADD COLUMN     "clip_end" INTEGER,
ADD COLUMN     "clip_start" INTEGER;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "plan",
ADD COLUMN     "planId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "plan",
ADD COLUMN     "planId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "SubPlan";

-- CreateTable
CREATE TABLE "membership_plans" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration_months" INTEGER NOT NULL DEFAULT 1,
    "benefits" TEXT[],
    "max_devices" INTEGER NOT NULL DEFAULT 1,
    "quality" TEXT NOT NULL DEFAULT '720p',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "percentage" INTEGER,
    "fixed_amount" INTEGER,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_films" (
    "id" SERIAL NOT NULL,
    "filmId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_films_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_slug_key" ON "membership_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "featured_films_position_key" ON "featured_films"("position");

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_films" ADD CONSTRAINT "featured_films_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
