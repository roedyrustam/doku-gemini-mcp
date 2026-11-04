import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DokuClient } from './core/client.js';
import { checkoutTools, handleCheckoutTool } from './tools/checkout.js';
import { virtualAccountTools, handleVirtualAccountTool } from './tools/virtual-account.js';
import { qrisTools, handleQrisTool } from './tools/qris.js';
import { ewalletTools, handleEwalletTool } from './tools/ewallet.js';
import { statusTools, handleStatusTool } from './tools/status.js';
import { refundTools, handleRefundTool } from './tools/refund.js';
import { snapTools, handleSnapTool } from './tools/snap.js';

// Export core SDK utilities for library consumers and scripts
export * from './core/constants.js';
export * from './core/types.js';
export * from './core/signer.js';
export * from './core/client.js';
export { allTools };

const allTools = [
  ...checkoutTools,
  ...virtualAccountTools,
  ...qrisTools,
  ...ewalletTools,
  ...statusTools,
  ...refundTools,
  ...snapTools,
];

async function main() {
  const client = new DokuClient();
  const env = client.getEnvironment();

  // Diagnostic output strictly on stderr to preserve Stdio JSON-RPC on stdout
  console.error('[doku-gemini-mcp] Starting DOKU MCP Server v1.3.0');
  console.error(
    `[doku-gemini-mcp] Mode: ${env.isProduction ? 'PRODUCTION (LIVE)' : 'SANDBOX'}`
  );
  console.error(`[doku-gemini-mcp] Base URL: ${env.baseUrl}`);
  console.error(
    `[doku-gemini-mcp] Credentials configured: ${env.hasCredentials ? 'YES' : 'NO (Set DOKU_CLIENT_ID & DOKU_SECRET_KEY)'}`
  );
  console.error(
    `[doku-gemini-mcp] SNAP Private Key: ${env.hasPrivateKey ? 'CONFIGURED' : 'NOT SET (Required for SNAP B2B Token)'}`
  );

  const server = new Server(
    {
      name: 'doku-gemini-mcp',
      version: '1.3.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      let result: unknown;

      if (name === 'create_checkout_payment' || name === 'cancel_checkout_order') {
        result = await handleCheckoutTool(name, args, client);
      } else if (name === 'create_virtual_account') {
        result = await handleVirtualAccountTool(name, args, client);
      } else if (name === 'create_qris_payment') {
        result = await handleQrisTool(name, args, client);
      } else if (name === 'create_ewallet_payment') {
        result = await handleEwalletTool(name, args, client);
      } else if (name === 'check_transaction_status') {
        result = await handleStatusTool(name, args, client);
      } else if (name === 'process_refund') {
        result = await handleRefundTool(name, args, client);
      } else if (name === 'get_snap_b2b_token' || name === 'create_snap_qris_payment') {
        result = await handleSnapTool(name, args, client);
      } else {
        throw new Error(`Unknown MCP Tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      console.error(`[doku-gemini-mcp] Tool execution error (${name}):`, errorMessage);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'ERROR',
                tool: name,
                error: errorMessage,
                recommendation:
                  'Check DOKU credentials, invoice_number uniqueness, and IDR amount format.',
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[doku-gemini-mcp] MCP Server connected via Stdio transport.');
}

// Only launch main() when executed directly as script, not when imported
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  main().catch((err) => {
    console.error('[doku-gemini-mcp] Fatal server startup error:', err);
    process.exit(1);
  });
}
