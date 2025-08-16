# GOD'S OWN PHONE GADGET

A modern e-commerce website for selling phones and gadgets, built with HTML, CSS, JavaScript, and Supabase for the backend.

## Live Demo

- Frontend: [https://glittery-torrone-d1184e.netlify.app/](https://glittery-torrone-d1184e.netlify.app/)
- Backend: Powered by [Supabase](https://supabase.com)

## Features

- 🛍️ Product browsing and search
- 🔐 User authentication and profiles
- 🛒 Shopping cart functionality
- 💳 Order processing
- 📱 Responsive design
- 💬 Customer messaging
- 👤 Admin dashboard for product management
- 🔄 Real-time updates
- 📦 Secure data storage

## Tech Stack

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Responsive Design
  
- Backend (Supabase):
  - Authentication
  - PostgreSQL Database
  - Row Level Security
  - Real-time Subscriptions
  - File Storage

## Project Structure
```
├── index.html         # Main entry point
├── style.css         # Main styles
├── loading.css       # Loading animations
├── script.js         # Core functionality
├── supabaseClient.js # Supabase integration
└── README.md         # Documentation
```

## Database Schema

- **profiles**: User profiles and preferences
- **products**: Product catalog
- **orders**: Customer orders
- **customerMessages**: Support messages

## Security Features

- Secure authentication via Supabase Auth
- Row Level Security (RLS) policies
- Protected API endpoints
- Secure file uploads
- Input validation

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Deep4474/GOD-OWN-PHONE-GADET.git
   ```

2. Open the project:
   ```bash
   cd GOD-OWN-PHONE-GADET
   ```

3. Configure Supabase:
   - Create a Supabase project
   - Set up the database tables
   - Configure authentication
   - Update supabaseClient.js with your project URL and anon key

4. Deploy:
   - Deploy to Netlify or any static hosting
   - Configure environment variables

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.