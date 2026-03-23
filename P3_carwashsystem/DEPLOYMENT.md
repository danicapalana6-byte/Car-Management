# CarWash Pro Deployment

## Render

1. Push this project to GitHub.
2. Create a MongoDB Atlas cluster and copy the connection string.
3. In Render, create a new `Web Service` from this repository.
4. Render will detect [`render.yaml`](/c:/Users/Administrator/OneDrive/Attachments/p3finals/P3_carwashsystem/render.yaml).
5. Set these environment variables in Render:
   - `MONGO_URI`
   - `EMAIL_USER`
   - `EMAIL_PASS`
6. Deploy.
7. Open the deployed URL. The root path now redirects to `/client/index.html`.

## MongoDB Atlas

1. Create a database user.
2. In `Network Access`, allow your deployment provider IPs or use `0.0.0.0/0` for testing.
3. Use a connection string like this:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/carwashpro?retryWrites=true&w=majority
```

## Local Test Before Deploy

1. Copy `.env.example` to `.env`.
2. Fill in your real values.
3. Run:

```powershell
npm start
```

4. Open:

```text
http://localhost:3000/client/index.html
```

## Notes

- GitHub Pages alone cannot run this app because signup/login need the Express API in [`server.js`](/c:/Users/Administrator/OneDrive/Attachments/p3finals/P3_carwashsystem/server.js).
- If you do not set `EMAIL_USER` and `EMAIL_PASS`, the app still works, but booking confirmation emails will be skipped.
