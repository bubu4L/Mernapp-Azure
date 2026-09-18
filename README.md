# MERN App - Ready for Azure Deployment

A minimal but complete MERN app (an "Items" list - add, view, delete)
structured specifically for the checkpoint's required deployment
pattern: the React frontend gets built, then its files are copied
into `server/public`, so a single Express server serves both the API
and the frontend from one Azure Web App.

## What's included

```
client/          -> React app (source only - you build it yourself, see below)
server/
  models/Item.js
  routes/items.js
  server.js      -> Express + Mongoose, serves server/public in production
  .env.example
  public/        -> currently just a placeholder - your build goes here
.gitignore
```

## Important: what I could and couldn't do here

I don't have an Azure account, and this sandbox has no network access
to install packages or reach any live services - so:

- **Verified:** every `.js` file (backend and frontend) passes a
  syntax check. The app's logic and structure are sound.
- **Not verified:** I could not actually run `npm install`, build the
  React app, start the server, or connect to MongoDB here - and I
  obviously can't create Azure resources or push to a Git remote that
  only exists once *you* create it in the Portal.

Everything below is written so you can do those parts yourself.

---

## Part 1: Run it locally first

1. **Backend:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   ```
   Edit `.env` and paste in your MongoDB Atlas connection string
   (same kind you've used in earlier checkpoints):
   ```
   MONGO_URI='mongodb+srv://<username>:<password>@<cluster-url>/<database-name>'
   PORT=5000
   ```
   Then:
   ```bash
   npm start
   ```
   You should see `Connected to MongoDB` and `Server running on port 5000`.

2. **Frontend (separate terminal):**
   ```bash
   cd client
   npm install
   npm start
   ```
   Opens at `http://localhost:3000`. Thanks to the `"proxy"` field in
   `client/package.json`, its `/api/items` calls are forwarded to
   your Express server on port 5000 automatically - add an item,
   confirm it appears, delete it, confirm it's gone.

## Part 2: Build the frontend for production

```bash
cd client
npm run build
```

This creates `client/build/`. Copy **everything inside it** into
`server/public` (replacing the placeholder file there):

```bash
# from the project root
rm server/public/README.txt
cp -r client/build/* server/public/
```

(On Windows, just open `client/build` in File Explorer, select all,
copy, and paste into `server/public`.)

## Part 3: MongoDB Atlas - one setting to change

Azure Web Apps don't have a single fixed IP address by default, so
your Atlas cluster's IP whitelist (which you set up in an earlier
checkpoint) needs to allow connections from anywhere:

1. In Atlas, go to **Network Access**.
2. Click **Add IP Address** -> **Allow Access from Anywhere**
   (this adds `0.0.0.0/0`).
3. Confirm.

(Worth knowing: this does widen who *could* attempt to connect - but
since the connection still requires your username/password, it's the
standard approach for apps hosted on platforms like Azure that don't
give you a fixed IP up front.)

## Part 4: Create the Azure Web App

1. Go to portal.azure.com and sign in (or create an account if you
   haven't).
2. Click **Create a resource** -> search **Web App** -> **Create**.
3. Fill in the Basics tab:
   - **Resource Group**: click "Create new", give it any name (e.g. `mern-checkpoint-rg`)
   - **Name**: a globally unique name (e.g. `yourname-mern-app`) - this becomes part of your URL
   - **Publish**: Code
   - **Runtime stack**: Node 24 LTS (or the latest LTS shown)
   - **Region**: whichever is closest to you
   - **Pricing plan**: for a checkpoint, the **Free (F1)** tier is enough
4. On the **Deployment** tab, near the bottom, set **Basic Authentication** to **Enabled** (needed for the Local Git method below).
5. Click **Review + create**, then **Create**. Wait for deployment to finish, then click **Go to resource**.

## Part 5: Set up deployment (Local Git)

1. On your new Web App's page, find **Deployment** in the left sidebar -> **Deployment Center**.
2. Under **Source**, choose **Local Git**, then **Save**.
3. Go to the **Local Git/FTPS credentials** tab (still in Deployment Center) to set/confirm a deployment username and password if prompted.
4. Back on the **Settings** tab, copy the **Git Clone URI** shown (looks like `https://<app-name>.scm.azurewebsites.net/<app-name>.git`).

## Part 6: Push your code

From your project's root folder (the one containing `client/` and `server/`):

```bash
git init
git add .
git commit -m "Initial commit"
git remote add azure <paste the Git Clone URI from step 5>
git push azure master
```
(If your default branch is `main` instead of `master`, use
`git push azure main:master`.)

You'll be prompted for the deployment username/password from step 5.3.
Azure will detect the push, install dependencies, and start your app.

## Part 7: Configure environment variables in Azure

Your `.env` file was never pushed (it's git-ignored on purpose), so
Azure doesn't know your `MONGO_URI` yet:

1. On your Web App's page, go to **Settings** -> **Configuration**.
2. Under **Application settings**, click **New application setting**.
3. Name: `MONGO_URI`, Value: your real connection string.
4. Click **OK**, then **Save** at the top, then **Continue** to confirm the app restart.

(Note: Azure sets `PORT` for you automatically in production - you
don't need to add it yourself; `server.js` already reads
`process.env.PORT`.)

## Part 8: Test it

1. Go back to your Web App's **Overview** page.
2. Click the **Default domain** link (something like
   `https://yourname-mern-app.azurewebsites.net`).
3. You should see the React app. Add an item, refresh, confirm it
   persisted (proves MongoDB is connected), delete it.

If something doesn't load, check **Monitoring** -> **Log stream** in
the sidebar for real-time server logs while you reload the page -
that's usually the fastest way to see what actually failed.
