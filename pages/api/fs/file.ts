import { NextApiRequest, NextApiResponse } from "next";
import { readFile, writeFile } from "fs-extra";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../../lib/session";

export default withIronSessionApiRoute(route, sessionOptions);

async function route(req: NextApiRequest, res: NextApiResponse<string>) {
  if (process.env.LOGIN_PASSWORD && !req.session.user)
    return res.status(401).end();

  try {
    const path = decodeURIComponent(req.query.path as string);
    const options = (typeof req.query.options === 'string'
      ? JSON.parse(req.query.options as string)
      : {}
    ) as { flag?: string | undefined } | { encoding: string, flag?: string | undefined };

    if (req.method === 'GET') {
      const data = await readFile(path, options);

      // Return data in JSON format so that file data and errors can be detected by JSON strings
      res.json(JSON.stringify({ data }));
    } else if (req.method === 'POST') {
      const data = req.body.data as string | undefined;

      await writeFile(path, data || "", options);

      res.end();
    }
  } catch (err) {
    res.status(400);

    if (err instanceof Error)
      return res.json(JSON.stringify({ error: { Error: err, message: err.message } }));
    else if (typeof err === 'string')
      return res.json(JSON.stringify({ error: err }));

    console.error(err);
    return res.end();
  }
}
