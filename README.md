# Project Manager

This is the public repository for a currently in development web-based project manager that is meant to be an access-anywhere tool for creating content and managing it's production.

## About

This web-based tool contains various sections that are meant to complete a certain task, including Songs, Notepad, Sketchbook, Schedule,
Projects, Microblog, and Links. While the Projects and Schedule section is meant to manage the actual process of creating the content, the other
sections are used as custom repositories of ideas and thoughts that can be accessed anywhere in a private manner.

This tool was originally coded raw in PHP but it is currently in the process of being ported to a NodeJS environment based on Next.js with React.js.
The project is being ported as part of an effort to learn and apply more modern web development frameworks.
*Bearing this in mind*, there are a few aspects of the code presented that I have realized are not ideal, such as defining too many components in a single page
or repeating similar components in the various pages that could be combined in other ways. However, code is currently in the process of being rewritten
to be up to production standards.

This project manager is designed to be used by a single individual and hosted privately. To ensure the privacy of the content, authentication and login functionality will be implemented in the near future.

### Working Features

- Songs
- Notepad
- Sketchbook
- Schedule
- Microblog

### Partially Working Features

- Links

### Broken Features

- Projects

### To Be Implemented

- Authentication and Login Page

## About Each Module

### Songs

The songs module is a module that is meant to facilitate the writing of 
original music. It contains tools to document song lyrics and songwriting sessions all with in-text references to audio files. Also
present is the melodies section, which is meant to house short audio files that contain musical ideas.

### Notepad

The notepage module is a module that is meant to house living text documents. Essentially, it is an online version of a plaintext editor that can be accessed from the web.

### Sketchbook

A simple repository for completed sketches that can be accessed anywhere when needed.

### Schedule

Page for managing tasks that need to completed with timekeeping features such as a clocking system.

### Projects

Based off of standard IT ticketing software, the Projects page is intended to be the ultimate tracker of tasks and aspects of managing a project. Including a note system, integration with the Schedule page, and modules that are specific to the various types of projects I work on, the Projects page is intended to be my main way to manage my personal tasks.

The Projects page was not included in the original version of the project manager, and it is currently broken due to an API error. However, the current code is still viewable and was at one point functional.

### Microblog

A simple write-only implementation of a microblog meant to house quick thoughts in a sequential format.

### Links

A simple page to store bookmarks.

## Setup and Compilation

### Prerequisites

- NodeJS
- MySQL

### Setup

Clone this repository into a directory and execute "init_database.sql" in the MySQL directory.

Afterwards, local environment variables will need to be populated in the following format into ".env.local" so mysql2 can connect to the database.

```
SQL_HOST=
SQL_DB=
SQL_USR=
SQL_PASS=
SQL_SOCK=
```

Following this, run the following command from the repository root:

```
npm install
```

Finally run the development environment using
```
npm run dev
```
Currently there is no protocol for pushing to production due to lack of completion.
