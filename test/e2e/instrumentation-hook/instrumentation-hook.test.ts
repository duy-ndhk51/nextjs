import { createNextDescribe } from 'e2e-utils'
import { check } from 'next-test-utils'
import path from 'path'

const describeCase = (
  caseName: string,
  callback: Parameters<typeof createNextDescribe>[2]
) => {
  createNextDescribe(
    caseName,
    {
      files: path.join(__dirname, caseName),
      nextConfig: {
        experimental: {
          instrumentationHook: true,
        },
      },
      skipDeployment: true,
    },
    callback
  )
}
describe('Instrumentation Hook', () => {
  describeCase('with-middleware', ({ next }) => {
    it('with-middleware should run the instrumentation hook', async () => {
      await next.render('/')
      await check(() => next.cliOutput, /instrumentation hook on the edge/)
    })
  })

  describeCase('with-edge-api', ({ next }) => {
    it('with-edge-api should run the instrumentation hook', async () => {
      await next.render('/api')
      await check(() => next.cliOutput, /instrumentation hook on the edge/)
    })
  })

  describeCase('with-edge-page', ({ next }) => {
    it('with-edge-page should run the instrumentation hook', async () => {
      await next.render('/')
      await check(() => next.cliOutput, /instrumentation hook on the edge/)
    })
  })

  describeCase('with-node-api', ({ next }) => {
    it('with-node-api should run the instrumentation hook', async () => {
      await next.render('/api')
      await check(() => next.cliOutput, /instrumentation hook on nodejs/)
    })
  })

  describeCase('with-node-page', ({ next }) => {
    it('with-node-page should run the instrumentation hook', async () => {
      await next.render('/')
      await check(() => next.cliOutput, /instrumentation hook on nodejs/)
    })
  })

  describeCase('general', ({ next, isNextDev }) => {
    it('should not overlap with a instrumentation page', async () => {
      const page = await next.render('/instrumentation')
      expect(page).toContain('Hello')
    })
    if (isNextDev) {
      it('should reload the server when the instrumentation hook changes', async () => {
        await next.render('/')
        await next.patchFile(
          './instrumentation.js',
          `export function register() {console.log('toast')}`
        )
        await check(() => next.cliOutput, /toast/)
        await next.renameFile(
          './instrumentation.js',
          './instrumentation.js.bak'
        )
        await check(
          () => next.cliOutput,
          /The instrumentation file has been removed/
        )
        await next.patchFile(
          './instrumentation.js.bak',
          `export function register() {console.log('bread')}`
        )
        await next.renameFile(
          './instrumentation.js.bak',
          './instrumentation.js'
        )
        await check(() => next.cliOutput, /The instrumentation file was added/)
        await check(() => next.cliOutput, /bread/)
      })
    }
  })
})
