# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
## Admission portal setup

Install dependencies with `npm install`, then start the development server with `npm run dev`. On Windows PowerShell systems where script execution is restricted, use `npm.cmd install` and `npm.cmd run dev`.

The home-page QR always targets the complete student application at `/register`.

### Test the QR on the same Wi-Fi

1. Connect the computer and phone to the same Wi-Fi network. In Windows, run `ipconfig` and note the computer's IPv4 address for that network (for example, `192.168.1.20`).
2. Create or edit the ignored `.env.local` file in the project root and set `VITE_PUBLIC_APP_URL=http://192.168.1.20:5173`, replacing the example address with the computer's actual Wi-Fi IPv4 address.
3. Restart the dev server with `npm.cmd run dev`. Vite listens on the network at port `5173`; allow Node/Vite through Windows Firewall on private networks if prompted.
4. Open `http://192.168.1.20:5173` on the computer. Scan the displayed QR with the phone's camera. Verify the phone opens `http://192.168.1.20:5173/register` and displays the first step of the admission form. The phone must use the same Wi-Fi; a `localhost` QR will not work on the phone.

During development only, a private IPv4 HTTP address is accepted for the LAN QR. An HTTPS URL with a public hostname may also be used. On a production build, configure `VITE_PUBLIC_APP_URL` in the hosting provider's build environment as the deployed public HTTPS origin (for example, `https://admissions.your-college.edu`) before building. The QR then targets `https://admissions.your-college.edu/register`. Localhost, private network addresses, and non-HTTPS URLs remain rejected in production. After deployment, scan the generated QR on a phone and verify that exact HTTPS `/register` URL loads the application.

The registration form supports camera photos, gallery images, and PDF files for certificates, plus a separate signature image upload. Image previews can be rotated, removed, and replaced. These files and background video settings are handled by the frontend demo/browser storage; durable upload, sharing across devices, and backend submission still require backend integration. No additional packages are needed for these frontend controls.

The supplied or officer-selected campus video is shared between the student landing page and all registration steps. It starts muted to satisfy browser autoplay rules; use the sound button at the lower-right to enable or mute audio. The video is intentionally hidden on the full application preview and returns when editing the form.

To verify locally, run `npm run lint` and `npm run build`, then open the URL printed by `npm run dev`. Check the multi-step registration, optional fields, document/signature previews, officer appearance settings, and student/admin navigation. A generated mobile QR can only be tested after deploying to the configured public HTTPS domain.
