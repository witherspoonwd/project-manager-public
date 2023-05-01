-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "-05:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wwnet`
--
DROP DATABASE IF EXISTS wwnet;
CREATE DATABASE wwnet;

USE wwnet;

-- --------------------------------------------------------

--
-- Table structure for table `microblog_posts`
--

CREATE TABLE `microblog_posts` (
  `postID` int NOT NULL,
  `postTitle` varchar(255) DEFAULT NULL,
  `postDateTime` varchar(255) DEFAULT NULL,
  `postContent` text,
  `isViewable` tinyint(1) DEFAULT '1',
  `platinumOnly` tinyint(1) DEFAULT NULL,
  `quoteTweetRef` varchar(255) DEFAULT NULL,
  `beenViewed` tinyint(1) DEFAULT NULL,
  `viewTime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_melodies`
--

CREATE TABLE `private_melodies` (
  `melodyID` int NOT NULL,
  `melodyTitle` varchar(255) DEFAULT NULL,
  `dateCreated` date DEFAULT NULL,
  `isViewable` tinyint(1) DEFAULT '1',
  `isRecent` tinyint(1) DEFAULT NULL,
  `htmlPath` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_notepad`
--

CREATE TABLE `private_notepad` (
  `noteID` int NOT NULL,
  `noteTitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `dateCreated` datetime DEFAULT CURRENT_TIMESTAMP,
  `dateUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isArchived` tinyint(1) DEFAULT NULL,
  `htmlContent` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_schedule`
--

CREATE TABLE `private_schedule` (
  `itemID` int NOT NULL,
  `title` text NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `dateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateCompleted` datetime DEFAULT NULL,
  `dateDue` datetime DEFAULT NULL,
  `isComplete` tinyint(1) DEFAULT NULL,
  `isViewable` tinyint(1) NOT NULL DEFAULT '1',
  `lastClockIn` datetime DEFAULT NULL,
  `hoursElapsed` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_sessions`
--

CREATE TABLE `private_sessions` (
  `sessionID` int NOT NULL,
  `sessionTitle` varchar(255) DEFAULT NULL,
  `dateCreated` date DEFAULT NULL,
  `isViewable` tinyint(1) DEFAULT '1',
  `isRecent` tinyint(1) DEFAULT NULL,
  `htmlPath` varchar(255) DEFAULT NULL,
  `htmlContent` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_sketchbook`
--

CREATE TABLE `private_sketchbook` (
  `sketchID` int NOT NULL,
  `sketchTitle` varchar(255) DEFAULT NULL,
  `sketchDate` date DEFAULT NULL,
  `isViewable` tinyint(1) DEFAULT NULL,
  `sketchComments` text,
  `sketchIMG` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_songs`
--

CREATE TABLE `private_songs` (
  `songID` int NOT NULL,
  `songTitle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `dateCreated` date DEFAULT NULL,
  `isViewable` tinyint(1) DEFAULT NULL,
  `isRecent` tinyint(1) DEFAULT NULL,
  `htmlPath` varchar(255) DEFAULT NULL,
  `htmlContent` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_items`
--

CREATE TABLE `project_items` (
  `projectID` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `dateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dateCompleted` datetime DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `hoursElapsed` float NOT NULL DEFAULT '0',
  `dueDate` datetime DEFAULT NULL,
  `songRef` int DEFAULT NULL,
  `notepadRef` int DEFAULT NULL,
  `isComplete` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_modules`
--

CREATE TABLE `project_modules` (
  `moduleID` int NOT NULL,
  `refID` int NOT NULL,
  `type` varchar(255) NOT NULL,
  `data` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_notes`
--

CREATE TABLE `project_notes` (
  `noteID` int NOT NULL,
  `refID` int DEFAULT NULL,
  `dateCreated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hoursElapsed` float NOT NULL DEFAULT '0',
  `content` text NOT NULL,
  `scheduleRefID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `microblog_posts`
--
ALTER TABLE `microblog_posts`
  ADD PRIMARY KEY (`postID`);

--
-- Indexes for table `private_melodies`
--
ALTER TABLE `private_melodies`
  ADD PRIMARY KEY (`melodyID`);

--
-- Indexes for table `private_notepad`
--
ALTER TABLE `private_notepad`
  ADD PRIMARY KEY (`noteID`);

--
-- Indexes for table `private_schedule`
--
ALTER TABLE `private_schedule`
  ADD PRIMARY KEY (`itemID`);

--
-- Indexes for table `private_sessions`
--
ALTER TABLE `private_sessions`
  ADD PRIMARY KEY (`sessionID`);

--
-- Indexes for table `private_sketchbook`
--
ALTER TABLE `private_sketchbook`
  ADD PRIMARY KEY (`sketchID`);

--
-- Indexes for table `private_songs`
--
ALTER TABLE `private_songs`
  ADD PRIMARY KEY (`songID`);

--
-- Indexes for table `project_items`
--
ALTER TABLE `project_items`
  ADD PRIMARY KEY (`projectID`);

--
-- Indexes for table `project_modules`
--
ALTER TABLE `project_modules`
  ADD PRIMARY KEY (`moduleID`);

--
-- Indexes for table `project_notes`
--
ALTER TABLE `project_notes`
  ADD PRIMARY KEY (`noteID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `microblog_posts`
--
ALTER TABLE `microblog_posts`
  MODIFY `postID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_melodies`
--
ALTER TABLE `private_melodies`
  MODIFY `melodyID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_notepad`
--
ALTER TABLE `private_notepad`
  MODIFY `noteID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_schedule`
--
ALTER TABLE `private_schedule`
  MODIFY `itemID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_sessions`
--
ALTER TABLE `private_sessions`
  MODIFY `sessionID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_sketchbook`
--
ALTER TABLE `private_sketchbook`
  MODIFY `sketchID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `private_songs`
--
ALTER TABLE `private_songs`
  MODIFY `songID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_items`
--
ALTER TABLE `project_items`
  MODIFY `projectID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_modules`
--
ALTER TABLE `project_modules`
  MODIFY `moduleID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_notes`
--
ALTER TABLE `project_notes`
  MODIFY `noteID` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
