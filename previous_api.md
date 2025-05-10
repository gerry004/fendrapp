from flask import Response
APP_ID = '1377511903432243'
APP_SECRET = '5a09e1554db473d8ab56ae5594f82697'
REDIRECT_URI = 'http://localhost:5000/api/facebook/callback'
SCOPE = 'instagram_basic,business_management,pages_show_list,instagram_manage_comments,pages_read_engagement'

# App ID: 971506081568143
# App Secret: c5af6bb03d7362db10a760dc9b1e76a4


@rest_api.route("/api/facebook/callback")
class FacebookCallback(Resource):
    """
    Handles the callback from Facebook OAuth and stores the long-lived access token
    """

    def get(self):
        # Get the authorization code and state (user ID) from the query parameters
        code = request.args.get("code")
        user_id = request.args.get("state")

        if not code:
            return {"success": False, "message": "No authorization code provided"}, 400

        if not user_id:
            return {"success": False, "message": "Invalid state parameter"}, 400

        try:
            # Find the user by ID
            user = Users.query.get(user_id)
            if not user:
                return {"success": False, "message": "User not found"}, 404

            # Exchange the code for a short-lived access token
            token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
            params = {
                "client_id": APP_ID,
                "redirect_uri": REDIRECT_URI,
                "client_secret": APP_SECRET,
                "code": code,
            }

            response = requests.get(token_url, params=params)

            if response.status_code != 200:
                return {
                    "success": False,
                    "message": "Failed to retrieve access token from Facebook",
                    "details": response.json(),
                }, 500

            # Get the short-lived access token
            data = response.json()
            short_lived_token = data.get("access_token")

            if not short_lived_token:
                return {
                    "success": False,
                    "message": "No access token found in the response",
                }, 400

            # Exchange for a long-lived access token
            long_lived_url = "https://graph.facebook.com/v19.0/oauth/access_token"
            long_lived_params = {
                "grant_type": "fb_exchange_token",
                "client_id": APP_ID,
                "client_secret": APP_SECRET,
                "fb_exchange_token": short_lived_token,
            }

            long_lived_response = requests.get(long_lived_url, params=long_lived_params)

            if long_lived_response.status_code != 200:
                return {
                    "success": False,
                    "message": "Failed to retrieve long-lived access token",
                    "details": long_lived_response.json(),
                }, 500

            long_lived_data = long_lived_response.json()
            long_lived_token = long_lived_data.get("access_token")

            if not long_lived_token:
                return {
                    "success": False,
                    "message": "No long-lived access token found",
                }, 400

            # Store the long-lived token in the user's record
            user.api_token = long_lived_token
            db.session.commit()

            # Redirect to the dashboard
            frontend_url = request.url_root.replace("/api", "")
            if frontend_url.endswith(":5000/"):
                frontend_url = frontend_url.replace(":5000/", ":3000/")

            dashboard_url = f"{frontend_url}app/dashboard/default"

            # Use a JavaScript redirect for cross-origin redirects
            html_response = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Redirecting...</title>
                <script>
                    window.location.href = "{dashboard_url}";
                </script>
            </head>
            <body>
                <p>Authentication successful! Redirecting to dashboard...</p>
                <p>If you are not redirected, <a href="{dashboard_url}">click here</a>.</p>
            </body>
            </html>
            """

            return Response(html_response, mimetype="text/html")

        except Exception as e:
            print(f"Error in Facebook callback: {str(e)}")
            return {"success": False, "message": f"Error: {str(e)}"}, 500