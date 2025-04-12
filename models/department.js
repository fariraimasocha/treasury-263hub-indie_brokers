import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = refreshModel("Department", departmentSchema);
export default Department;