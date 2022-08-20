const roles = [
    {
        role: "ADMIN",
        allowed: ["POST", "PATCH", "GET", "PUT", "DELETE"]
    }, {
        role: "SELLER",
        allowed: ["POST", "GET", "PATCH", "PUT"]
    }, {
        role: "SUPPORTER",
        allowed: ["DELETE", "GET"]
    }, {
        role: "CUSTOMER",
        allowed: ["GET"]
    }
]

module.exports = roles;