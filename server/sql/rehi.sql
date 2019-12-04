SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `rehi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `rehi`;

DROP TABLE IF EXISTS `rehi_channel`;
CREATE TABLE `rehi_channel` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ur` int(10) UNSIGNED NOT NULL,
  `type` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` int(10) UNSIGNED NOT NULL,
  `sidebar` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tag1` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tag2` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `tag3` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `rehi_user`;
CREATE TABLE `rehi_user` (
  `id` int(10) UNSIGNED NOT NULL,
  `confirmed` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `username` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `login` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `login_created` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `login_remember` tinyint(1) UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `rehi_channel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `id_ur` (`id_ur`),
  ADD KEY `tag1` (`tag1`),
  ADD KEY `tag2` (`tag2`),
  ADD KEY `tag3` (`tag3`);

ALTER TABLE `rehi_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);


ALTER TABLE `rehi_channel`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `rehi_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
