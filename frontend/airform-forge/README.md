# 🚀 AirForm Forge

A beautiful, modern React frontend for building dynamic forms from your Airtable data. Create forms with conditional logic, collect responses, and sync everything back to your Airtable bases seamlessly.

![AirForm Forge](https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.3)

## ✨ Features

- **🔗 Airtable Integration**: Connect directly to your Airtable account via OAuth
- **🎨 Visual Form Builder**: Drag-and-drop interface to create forms from your Airtable fields
- **🧠 Conditional Logic**: Show/hide fields based on user responses with powerful logic rules
- **📁 File Uploads**: Support for multiple file attachments with progress tracking
- **📄 PDF Export**: Export blank or filled forms as PDFs
- **🔒 Secure & Private**: Your data stays in your Airtable - we never store sensitive information
- **📱 Responsive Design**: Beautiful, accessible interface that works on all devices
- **⚡ Real-time Sync**: Responses automatically sync to your Airtable base

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for global state management
- **Animations**: Framer Motion for smooth interactions
- **HTTP**: Axios with credential support
- **Drag & Drop**: react-beautiful-dnd

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Your backend API running (see backend requirements below)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-git-url>
   cd airform-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your backend URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 🔧 Backend Requirements

This frontend requires a compatible backend API. Your backend should provide these endpoints:

### Authentication
- `GET /api/auth/airtable/login` - Redirect to Airtable OAuth
- `GET /api/auth/airtable/callback` - OAuth callback handler
- `POST /api/auth/logout` - Logout user

### Airtable Data
- `GET /api/airtable/bases` - Get user's Airtable bases
- `GET /api/airtable/tables?baseId=<id>` - Get tables in a base
- `GET /api/airtable/fields?baseId=<id>&tableId=<id>` - Get fields in a table

### Form Management
- `POST /api/forms` - Create new form
- `GET /api/forms` - List user's forms
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Public Forms
- `GET /api/public/forms/:publicId` - Get public form schema
- `POST /api/public/forms/:publicId/submit` - Submit form response

### File Uploads
- `POST /api/upload` - Upload files (multipart/form-data)

### PDF Export
- `GET /api/forms/:id/export/pdf` - Export blank PDF
- `POST /api/forms/:id/export/pdf` - Export filled PDF

**Important**: All protected endpoints must support cookie-based sessions. The frontend is configured to send credentials with all requests.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── form-builder/       # Form builder components
│   ├── form-renderer/      # Form rendering components
│   └── ProtectedRoute.tsx  # Route protection
├── pages/
│   ├── Landing.tsx         # Landing page with OAuth
│   ├── Dashboard.tsx       # Form management dashboard
│   ├── FormBuilder.tsx     # Visual form builder
│   ├── FormPreview.tsx     # Form preview and settings
│   └── PublicForm.tsx      # Public form viewer
├── stores/
│   ├── authStore.ts        # Authentication state
│   └── formStore.ts        # Form builder state
├── services/
│   └── api.ts              # API client and endpoints
├── types/
│   └── index.ts            # TypeScript type definitions
└── index.css               # Design system and styles
```

## 🎨 Design System

The app uses a comprehensive design system defined in `src/index.css`:

- **Colors**: Semantic color tokens for consistent theming
- **Components**: Pre-built component classes (`.btn-hero`, `.card-elevated`, etc.)
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first approach with consistent spacing

## 🔒 Security Notes

- All API calls include credentials for cookie-based authentication
- File uploads are validated and processed securely
- Form submissions are validated client-side and server-side
- No sensitive data is stored in browser localStorage

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your production backend URL
3. Deploy from the `main` branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure redirects for SPA routing

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Integration Checklist

When connecting to your backend, ensure:

- [ ] CORS is configured to allow your frontend domain
- [ ] Cookie-based sessions are properly configured
- [ ] File upload endpoint accepts `multipart/form-data`
- [ ] All protected routes validate session cookies
- [ ] OAuth redirect URLs match your frontend domain
- [ ] Error responses include helpful message fields

## 🆘 Troubleshooting

### Common Issues

**"Network Error" on API calls**
- Check that `VITE_API_URL` is set correctly
- Ensure your backend is running and accessible
- Verify CORS configuration on backend

**Authentication not working**
- Check OAuth redirect URLs in Airtable app settings
- Verify session cookie configuration
- Ensure backend `/auth/airtable/callback` redirects to frontend

**File uploads failing**
- Check backend `/upload` endpoint accepts multipart data
- Verify file size limits on backend
- Ensure proper error handling for upload failures

**Form submissions not saving**
- Verify Airtable API permissions on backend
- Check that field types match between frontend and Airtable
- Ensure required fields are properly validated


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
