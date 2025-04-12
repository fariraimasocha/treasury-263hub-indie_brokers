import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const fundRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dept: {
      type: String,
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "disbursed", "settled"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    submittedAt: {
      type: Date,
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
    year: {
      type: Number,
      required: true,
    },
    quater: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate request number if not provided
fundRequestSchema.pre("save", async function (next) {
  if (!this.requestNumber) {
    const currentYear = new Date().getFullYear();
    const count = await mongoose.models.FundRequest.countDocuments();
    this.requestNumber = `REQ-${currentYear}-${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

const FundRequest = refreshModel("FundRequest", fundRequestSchema);
export default FundRequest;