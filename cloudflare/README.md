# Cloudflare Worker API Endpoints

This Cloudflare Worker provides authentication proxy services for the EEN Login application.

## Endpoints

### `/proxy/getAccessToken`
- **Method**: GET
- **Purpose**: Exchange authorization code for access token
- **Parameters**: 
  - `code`: Authorization code from OAuth flow
  - `redirect_uri`: Redirect URI used in OAuth flow
- **Response**: Access token, expiration time, and HTTPS base URL
- **Sets**: `sessionId` cookie for session management

### `/proxy/refreshAccessToken`
- **Method**: POST
- **Purpose**: Refresh an expired access token using stored refresh token
- **Authentication**: Requires `sessionId` cookie
- **Response**: New access token and expiration time

### `/proxy/revoke`
- **Method**: POST
- **Purpose**: Revoke the current session's refresh token and clear session
- **Authentication**: Requires `sessionId` cookie
- **Response**: Success message
- **Side Effects**: Removes session from KV store and clears `sessionId` cookie

### `/admin/removeSessions`
- **Method**: DELETE
- **Purpose**: Clear all remote sessions except the current one
- **Authentication**: Requires `sessionId` cookie
- **Response**: JSON with deletion summary
- **Use Case**: Security feature to log out all other devices/sessions

### `/admin/sessionsCount`
- **Method**: GET
- **Purpose**: Get the total number of active sessions in the KV store
- **Authentication**: Requires `sessionId` cookie
- **Response**: JSON with session count
- **Use Case**: Monitoring and administrative purposes

### `/admin/version`
- **Method**: GET
- **Purpose**: Get the deployment version from the KV store
- **Authentication**: Requires `sessionId` cookie
- **Response**: JSON with version string
- **Use Case**: Version tracking and deployment information

## Authentication

All endpoints except `/proxy/getAccessToken` require a valid `sessionId` cookie that corresponds to an active session in the KV store.

## CORS

The worker supports CORS for cross-origin requests with credentials (cookies) enabled.

## Environment Variables

- `CLIENT_ID`: OAuth client ID for EEN authentication
- `CLIENT_SECRET`: OAuth client secret for EEN authentication
- `EEN_LOGIN`: KV namespace binding for session storage

## Example Responses

### Success Response for `/admin/version`:
```json
{
  "version": "v1.2.3"
}
```

### Error Response (401 Unauthorized):
```
Session ID cookie missing
```