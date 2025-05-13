import { ApiResponse } from "../utils/api-response.js";
import asyncHandler from "../utils/async-handler.js";

const healthCheck = asyncHandler(async (req, res) => {
  const response = new ApiResponse(200, "Server is running");
  res.status(200).json(response);
});

export { healthCheck };
