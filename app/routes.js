import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.jsx"),
  route("feedback", "routes/home.jsx"),
  route("results", "routes/results.jsx"),
];