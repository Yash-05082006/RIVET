export function renderErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Internal Server Error</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background-color: #f8f9fa;
        color: #212529;
      }
      .container {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      h1 { font-size: 2rem; margin-bottom: 1rem; }
      p { color: #6c757d; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred. Please try again later.</p>
    </div>
  </body>
</html>`;
}
