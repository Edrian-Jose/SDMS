module.exports = [
  {
    method: "GET",
    path: /^\/api\/students\/?$/i,
    user_access: [true, true, true, true, true]
  },
  {
    method: "POST",
    path: /^\/api\/students\/?$/i,
    user_access: [false, true, true, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/students\/(?:([^\/]+?))\/?$/i,
    user_access: [true, true, true, true, true]
  },
  {
    method: "PUT",
    path: /^\/api\/students\/(?:([^\/]+?))\/?$/i,
    user_access: [false, true, false, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/students\/(?:([^\/]+?))\/?$/i,
    user_access: [false, true, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/students\/(?:([^\/]+?))\/downloads\/sf10\/?$/i,
    user_access: [false, true, false, true, true]
  },
  {
    method: "GET",
    path: /^\/api\/students\/(?:([^\/]+?))\/downloads\/reportCard\/?$/i,
    user_access: [false, true, false, true, true]
  },
  {
    method: "POST",
    path: /^\/api\/students\/(?:([^\/]+?))\/grades\/?$/i,
    user_access: [true, false, false, false, true]
  },
  {
    method: "DELETE",
    path: /^\/api\/students\/(?:([^\/]+?))\/grades\/?$/i,
    user_access: [true, false, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/teachers\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/teachers\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/teachers\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "PUT",
    path: /^\/api\/teachers\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "PUT",
    path: /^\/api\/teachers\/(?:([^\/]+?))\/resetpassword\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/teachers\/(?:([^\/]+?))\/logs\/?$/i,
    user_access: [true, true, true, true, true]
  },
  {
    method: "GET",
    path: /^\/api\/sections\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/sections\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/sections\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/sections\/(?:([^\/]+?))\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "DELETE",
    path: /^\/api\/sections\/(?:([^\/]+?))\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "DELETE",
    path: /^\/api\/sections\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "POST",
    path: /^\/api\/enroll\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "DELETE",
    path: /^\/api\/enroll\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, true, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/notices\/?$/i,
    user_access: [true, true, true, true, true]
  },
  {
    method: "POST",
    path: /^\/api\/notices\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "DELETE",
    path: /^\/api\/notices\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "PUT",
    path: /^\/api\/notices\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/downloads\/sf10\/?$/i,
    user_access: [false, true, false, true, true]
  },
  {
    method: "GET",
    path: /^\/api\/downloads\/sf1\/?$/i,
    user_access: [false, false, true, true, true]
  },
  {
    method: "GET",
    path: /^\/api\/downloads\/reportCards\/?$/i,
    user_access: [false, true, true, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/downloads\/encodedGrades\/?$/i,
    user_access: [true, false, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/logs\/?$/i,
    user_access: [false, false, false, false, true]
  },
  {
    method: "GET",
    path: /^\/api\/logs\/(?:([^\/]+?))\/?$/i,
    user_access: [false, false, false, false, true]
  }
];
