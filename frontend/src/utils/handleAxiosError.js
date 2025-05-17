export const handleAxiosError = (error) => ({
  error: error?.response?.data?.message || error.message || "Something went wrong",
  isLoading: false,
});
