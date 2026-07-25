CREATE DATABASE IF NOT EXISTS doughe
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doughe;

CREATE TABLE IF NOT EXISTS users (
  userId      INT AUTO_INCREMENT PRIMARY KEY,
  firstName   VARCHAR(255) NOT NULL,
  lastName    VARCHAR(255) NOT NULL,
  userName    VARCHAR(255),
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  theme       VARCHAR(50)  DEFAULT 'light',
  userRole    ENUM('admin','manager','user') DEFAULT 'user',
  createDate  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateDate  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  adminId     INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT NOT NULL UNIQUE,
  accessLevel VARCHAR(50) DEFAULT 'standard',
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_user FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipes (
  recipeId         INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  doughFamily      VARCHAR(100) NOT NULL,
  hydration        INT,
  difficulty       ENUM('easy','medium','hard') DEFAULT 'easy',
  totalTimeMinutes INT,
  steps            JSON,
  authorId         INT,
  createDate       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updateDate       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipe_author FOREIGN KEY (authorId) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
  ingredientId INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  recipeId     INT NOT NULL,
  ingredientId INT NOT NULL,
  amount       FLOAT,
  unit         VARCHAR(50),
  UNIQUE KEY uniq_recipe_ingredient (recipeId, ingredientId),
  CONSTRAINT fk_ri_recipe     FOREIGN KEY (recipeId)     REFERENCES recipes(recipeId)         ON DELETE CASCADE,
  CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredientId) REFERENCES ingredients(ingredientId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
  commentId INT AUTO_INCREMENT PRIMARY KEY,
  recipeId  INT NOT NULL,
  userId    INT,
  text      TEXT NOT NULL,
  rating    INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_recipe FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user   FOREIGN KEY (userId)   REFERENCES users(userId)     ON DELETE SET NULL
);

-- recipe_likes (JUNCTION: many-to-many users <-> recipes, "likes")
CREATE TABLE IF NOT EXISTS recipe_likes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  userId    INT NOT NULL,
  recipeId  INT NOT NULL,
  note      TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_recipe_like (userId, recipeId),
  CONSTRAINT fk_like_user   FOREIGN KEY (userId)   REFERENCES users(userId)     ON DELETE CASCADE,
  CONSTRAINT fk_like_recipe FOREIGN KEY (recipeId) REFERENCES recipes(recipeId) ON DELETE CASCADE
);
