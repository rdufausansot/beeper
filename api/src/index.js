import "dotenv/config.js";

import express from "express";
import "express-async-errors";

import cors from "cors";
import bodyParser from "body-parser";

import { checkJwt } from "./auth/jwt-middleware.js";
import { getUserHome } from "./use-case/get-user-home.js";
import { BeepTooLongError, postBeep } from "./use-case/post-beep.js";
import { getUserPageByUsername } from "./use-case/get-user-page.js";
import { UsernameNotFound } from "./auth/auth0-client.js";
import { UserIdNotFound, follow, unfollow } from "./use-case/follow.js";
import { BeepNotFoundError, like, unlike } from "./use-case/like.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(checkJwt);

app.get("/home", async (req, res) => {
  const home = await getUserHome(req.auth.sub);
  res.status(200).json(home);
});

app.post("/beep", async (req, res) => {
  try {
    const postedBeep = await postBeep(req.auth.sub, req.body.content);
    res.status(201).json(postedBeep);
  } catch (e) {
    if (e instanceof BeepTooLongError) {
      res.status(400).send("Beep too long");
    } else {
      throw e;
    }
  }
});

app.get("/user/:username", async (req, res) => {
  try {
    const userPage = await getUserPageByUsername(
      req.auth.sub,
      req.params.username
    );
    res.status(200).json(userPage);
  } catch (e) {
    if (e instanceof UsernameNotFound) {
      res.status(400).send("User not found");
    } else {
      throw e;
    }
  }
});

app.put("/follow/:userId", async (req, res) => {
  try {
    await follow(req.auth.sub, req.params.userId);
    res.status(200).send();
  } catch (e) {
    if (e instanceof UserIdNotFound) {
      res.status(400).send("User not found");
    } else {
      throw e;
    }
  }
});

app.put("/unfollow/:userId", async (req, res) => {
  try {
    await unfollow(req.auth.sub, req.params.userId);
    res.status(200).send();
  } catch (e) {
    if (e instanceof UserIdNotFound) {
      res.status(400).send("User not found");
    } else {
      throw e;
    }
  }
});

app.put("/like/:beepId", async (req, res) => {
  try {
    await like(req.auth.sub, req.params.beepId);
    res.status(200).send();
  } catch (e) {
    if (e instanceof BeepNotFoundError) {
      res.status(400).send("Beep not found");
    } else {
      throw e;
    }
  }
});

app.put("/unlike/:beepId", async (req, res) => {
  try {
    await unlike(req.auth.sub, req.params.beepId);
    res.status(200).send();
  } catch (e) {
    if (e instanceof BeepNotFoundError) {
      res.status(400).send("Beep not found");
    } else {
      throw e;
    }
  }
});

app.listen(8080);
