import mongoose from "mongoose";

/**
 * Refreshes a Mongoose model by removing it from the model registry and recompiling it
 * @param {string} modelName - The name of the model to refresh
 * @param {mongoose.Schema} schema - The schema to use for recompiling the model
 * @returns {mongoose.Model} - The refreshed model
 */
export const refreshModel = (modelName, schema) => {
  if (mongoose.models[modelName]) {
    delete mongoose.models[modelName];
  }

  return mongoose.model(modelName, schema);
};
