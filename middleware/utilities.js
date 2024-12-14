const userModel = require("../models/userModel");
const carModel = require("../models/carModel")

const isAuthenticated = async (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

const findOrCreateUserInDatabase = async (githubProfile) => {
  // Check if the user already exists using GitHub ID
  const existingUser = await userModel.getByGithubId( githubProfile.id );

  if (existingUser) {
    return existingUser;
  }

  // If user does not exist, create a new one
  const newUser = {
    name: githubProfile.displayName || githubProfile.username,
    email: githubProfile.email || null, // GitHub may not provide an email
    role: "client", // Default role
    githubId: githubProfile.id,
    avatarUrl: githubProfile.avatar_url || null,
    registeredDate: new Date().toISOString(),
  };

  const result = await userModel.createUser(newUser);
  return result;
};

// Middleware to check if the user has a specific role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.session?.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send("Forbidden: You do not have access.");
    }
    next();
  };
};

// Middleware to check if the user owns the resource
const authorizeOwnership = (paramKey = "id", ownerKey = "_id") => {
  return (req, res, next) => {
    const user = req.session?.user;
    const resourceOwnerId = req.params[paramKey]; // ID from the route params

    if (!user || user[ownerKey] !== resourceOwnerId) {
      return res.status(403).send("Forbidden: You do not own this resource.");
    }
    next();
  };
};

const authorizeCarOwnership = async (req, res, next) => {
  try {
    const user = req.session?.user;
    const resourceId = req.params.id;
    const car = await carModel.getCarById(resourceId)

    if (!car) return res.status(404).send("Car not found.");
    if (user.role !== "admin" || user._id !== car.ownerId)
      return res.status(403).send("Forbidden: You do not own this car.");

    next();
  } catch (err) {
    res.status(500).send("Internal server error.");
  }
};

// Combined middleware to check both roles and ownership
const authorizeRoleOrOwnership = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.session?.user;
    const resourceOwnerId = req.params.id; // ID from the route params

    if (
      user &&
      (allowedRoles.includes(user.role) || user._id === resourceOwnerId)
    ) {
      return next();
    }

    return res.status(403).send("Forbidden: Insufficient permissions.");
  };
};

// Middleware to restrict role updates to admins
const restrictRoleUpdate = () => {
  return (req, res, next) => {
    if (req.body.role && req.session?.user?.role !== "admin") {
      return res.status(403).send("Forbidden: Only admins can update roles.");
    }
    next();
  };
};

module.exports = {
  isAuthenticated,
  findOrCreateUserInDatabase,
  authorizeRole,
  authorizeOwnership,
  authorizeRoleOrOwnership,
  restrictRoleUpdate,
  authorizeCarOwnership 
};
