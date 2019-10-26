import { GunGraphAdapter, GunGraphData } from '@chaingun/types'
import express, { Request, Response } from 'express'

const API_HEADERS = {
  'Content-Type': 'application/json'
}

export async function handleGet(
  adapter: GunGraphAdapter,
  req: Request,
  res: Response
): Promise<void> {
  try {
    const soul = req.path.replace('/gun/nodes/', '')
    // tslint:disable-next-line: no-let
    let str = ''

    if (adapter.getJsonStringSync) {
      str = adapter.getJsonStringSync(soul)
    } else if (adapter.getJsonString) {
      str = await adapter.getJsonString(soul)
    } else if (adapter.getSync) {
      const json = adapter.getSync(soul)
      str = json ? JSON.stringify(json) : ''
    } else {
      const json = await adapter.get(soul)
      str = json ? JSON.stringify(json) : ''
    }

    if (!str) {
      res.writeHead(404, API_HEADERS)
      res.write('null')
      res.end()
      return
    }

    res.header(API_HEADERS)
    res.send(str)
    res.end()
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e.stack || e)
    res.writeHead(500, API_HEADERS)
    res.write('null')
    res.end()
  }
}

export async function handlePut(
  adapter: GunGraphAdapter,
  req: Request,
  res: Response
): Promise<void> {
  const data = req.body
  // tslint:disable-next-line: no-let
  let diff: GunGraphData = {}

  try {
    if (adapter.putSync) {
      const result = adapter.putSync(data)
      if (result) {
        diff = result
      }
    } else {
      const result = await adapter.put(data)
      if (result) {
        diff = result
      }
    }

    res.header(API_HEADERS)
    res.json(diff)
    res.end()
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e.stack || e)
    res.writeHead(500, API_HEADERS)
    res.send('null')
    res.end()
  }
}

export function createServer(adapter: GunGraphAdapter): express.Application {
  const app = express()
  app.use(express.json())

  app.get('/gun/nodes/*', (req, res) => {
    handleGet(adapter, req, res)
  })

  app.put('/gun/nodes', (req, res) => {
    handlePut(adapter, req, res)
  })

  return app
}
