import http from "k6/http";
import { check } from "k6";

export default function () {
  const response = http.get("http://localhost:3000/health");
  check(response, {
    "api health is reachable": (res) => res.status === 200,
  });
}
