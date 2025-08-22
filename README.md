
To get started, take a look at src/app/page.tsx.

## Troubleshooting

### `EPERM: operation not permitted` error on Windows

If you see an error message like `EPERM: operation not permitted, rename ... query_engine-windows.dll.node` when running `npm install` or `npm run dev`, it means a running process has locked the file. This is common on Windows.

To fix this, you need to stop all running Node.js processes:

1.  **Stop your development server** (press `Ctrl + C` in the terminal).
2.  **Open Task Manager** (press `Ctrl + Shift + Esc`).
3.  Go to the **"Details"** tab.
4.  Find all processes named **"node.exe"**.
5.  For each "node.exe" process, select it and click **"End task"**.
6.  Once all "node.exe" processes are gone, run the following command in your terminal to safely regenerate the Prisma client:
    ```bash
    npx prisma generate
    ```
7.  Now, you can restart your development server:
    ```bash
    npm run dev
    ```
The error should now be resolved.
