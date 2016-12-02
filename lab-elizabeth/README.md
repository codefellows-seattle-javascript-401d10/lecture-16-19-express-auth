## Description

Bookstagram is a basic program that allows users to set up a file-sharing REST-API.

### Use

First, you should make sure that NodeJS is installed, you can download it [here.](https://nodejs.org/en/)

Then, you want to go to the directory containing the package.json file (using your terminal) and install all dependencies with the command:

```
npm install
```

### Routes

There are three Models used in this API, the User, Gallery and Pic. The User Model allows you to create Galleries which allows you to create and store Pics.

  - **User**

    - (signup) POST `/api/signup`
      input :
      ```json
      {
        "username": "<username>",
        "password": "<password>"
      }
      ```
    - (login) GET `/api/login`
      input :
      ```json
      {
        "username": "<username>",
        "password": "<password>"
      }
      ```

  - **Gallery**

    - POST `/api/gallery`
      input :
      ```json
      {
        "name": "<gallery name>",
        "desc": "<description>"
      }
      ```
    - GET `/api/gallery/:galleryID`
      input : `null`
    - PUT `/api/gallery/:galleryID`
      input :
      ```json
      {
        "name": "<new gallery name>",
        "desc": "<new description>"
      }
      ```
    - DELETE `/api/gallery/:galleryID`
      input : `null`

  - **PIC**

    - POST `/api/gallery/:galleryID/pic`
      input :
      ```json
      {
        "name": "<image name>",
        "desc": "<image description>",
        "image": "<image location>"
      }
      ```
    - DELETE `/api/gallery/:galleryID/pic/:picID`
      input: `null`
