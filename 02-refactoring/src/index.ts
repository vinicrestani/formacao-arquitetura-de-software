import express, { type Request, type Response } from "express";
import crypto from "crypto";
import pgp from "pg-promise";
import cors from "cors";
import { validateCpf } from "./validateCpf.ts";
import { validateName } from "./validateName.ts";

const app = express();
app.use(express.json());
app.use(cors());

const BD_URL = "postgres://postgres:123456@localhost:5432/app";
const connection = pgp()(BD_URL);

function validateInput(input: any) {
  if (!validateName(input.name)) {
    return "Invalid name";
  }
  if (!input.email.match(/.+@.+\..+/)) {
    return "Invalid email";
  }
  if (!validateCpf(input.document)) {
    return "Invalid document";
  }
  if (!input.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/)) {
    return "Invalid password";
  }
  return null;
}

const INSERT_ACCOUNT_QUERY =
  "insert into app.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)";

function insertAccount(accountId: string, input: any) {
  return connection.query(INSERT_ACCOUNT_QUERY, [
    accountId,
    input.name,
    input.email,
    input.document,
    input.password,
  ]);
}

app.post("/signup", async (req: Request, res: Response) => {
  const accountId = crypto.randomUUID();
  const input = req.body;
  const validationError = validateInput(input);
  if (validationError) {
    res.status(400).json({
      error: validationError,
    });
    return;
  }
  await insertAccount(accountId, input);
  res.status(201).json({
    accountId,
  });
});

const SELECT_ACCOUNT_QUERY = "select * from app.account where account_id = $1";

async function getAccountById(accountId: string) {
  const [accountRow] = await connection.query(SELECT_ACCOUNT_QUERY, [
    accountId,
  ]);
  const accountData = {
    accountId: accountRow.account_id,
    name: accountRow.name,
    email: accountRow.email,
    document: accountRow.document,
    password: accountRow.password,
  };
  return accountData;
}

app.get("/accounts/:accountId", async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  const accountData = await getAccountById(accountId);
  res.json(accountData);
});

app.listen(3000);
