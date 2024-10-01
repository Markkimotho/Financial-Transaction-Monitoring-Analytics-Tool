# API Documentation

## User API
- **POST /api/register**: Register a new user and send an email verification.
  - **Request Body**: 
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe"
    }
    ```
  - **Response**: 
    - **201 Created**: User successfully registered.
    - **400 Bad Request**: Validation errors.
  
- **POST /api/login**: Authenticate users.
  - **Request Body**: 
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword"
    }
    ```
  - **Response**: 
    - **200 OK**: Authentication successful.
    - **401 Unauthorized**: Invalid credentials.

- **POST /api/oauth**: OAuth login (Google/Facebook).
  - **Request Body**: Token from OAuth provider.
  - **Response**: 
    - **200 OK**: Authentication successful.
    - **401 Unauthorized**: Invalid token.

- **POST /api/logout**: Log out the user.
  - **Response**: 
    - **200 OK**: Successfully logged out.

- **POST /api/forgot-password**: Send a password reset link.
  - **Request Body**: 
    ```json
    {
      "email": "user@example.com"
    }
    ```
  - **Response**: 
    - **200 OK**: Reset link sent.
    - **404 Not Found**: Email not registered.

- **PUT /api/reset-password**: Update user password.
  - **Request Body**: 
    ```json
    {
      "token": "reset_token",
      "newPassword": "newsecurepassword"
    }
    ```
  - **Response**: 
    - **200 OK**: Password updated successfully.
    - **400 Bad Request**: Invalid token or password.

- **GET /api/profile**: Retrieve the authenticated user’s profile.
  - **Response**: 
    - **200 OK**: Returns user profile data.

- **PUT /api/profile**: Update profile information.
  - **Request Body**: 
    ```json
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "janedoe"
    }
    ```
  - **Response**: 
    - **200 OK**: Profile updated successfully.

- **DELETE /api/deactivate**: Deactivate the user’s account.
  - **Response**: 
    - **200 OK**: Account deactivated successfully.

## Transaction API
- **POST /api/transactions**: Add a new transaction.
  - **Request Body**: 
    ```json
    {
      "amount": 100,
      "description": "Groceries",
      "category": "Food",
      "date": "2023-09-30"
    }
    ```
  - **Response**: 
    - **201 Created**: Transaction added successfully.
    - **400 Bad Request**: Validation errors.

- **GET /api/transactions**: Retrieve transactions with filtering options.
  - **Query Parameters**: 
    - `startDate`: Filter by start date.
    - `endDate`: Filter by end date.
    - `category`: Filter by category.
  - **Response**: 
    - **200 OK**: Returns list of transactions.

- **GET /api/transactions/{id}**: Retrieve a specific transaction.
  - **Response**: 
    - **200 OK**: Returns transaction data.
    - **404 Not Found**: Transaction not found.

- **PUT /api/transactions/{id}**: Update a transaction.
  - **Request Body**: 
    ```json
    {
      "amount": 120,
      "description": "Updated groceries",
      "category": "Food",
      "date": "2023-09-30"
    }
    ```
  - **Response**: 
    - **200 OK**: Transaction updated successfully.
    - **404 Not Found**: Transaction not found.

- **DELETE /api/transactions/{id}**: Soft delete a transaction for audit.
  - **Response**: 
    - **204 No Content**: Transaction deleted successfully.
    - **404 Not Found**: Transaction not found.

## Budget API
- **POST /api/budget**: Create a new budget.
  - **Request Body**: 
    ```json
    {
      "name": "Monthly Budget",
      "amount": 500
    }
    ```
  - **Response**: 
    - **201 Created**: Budget created successfully.
    - **400 Bad Request**: Validation errors.

- **GET /api/budget**: Retrieve all budgets for the user.
  - **Response**: 
    - **200 OK**: Returns list of budgets.

- **GET /api/budget/{id}**: Retrieve a specific budget.
  - **Response**: 
    - **200 OK**: Returns budget data.
    - **404 Not Found**: Budget not found.

- **PUT /api/budget/{id}**: Update a budget.
  - **Request Body**: 
    ```json
    {
      "name": "Updated Monthly Budget",
      "amount": 600
    }
    ```
  - **Response**: 
    - **200 OK**: Budget updated successfully.
    - **404 Not Found**: Budget not found.

- **DELETE /api/budget/{id}**: Delete a budget.
  - **Response**: 
    - **204 No Content**: Budget deleted successfully.
    - **404 Not Found**: Budget not found.

## Visualization API
- **GET /api/charts/spending-income**: Retrieve spending vs. income data.
  - **Response**: 
    - **200 OK**: Returns data for spending vs. income.

- **GET /api/charts/category-breakdown**: Retrieve category breakdown data.
  - **Response**: 
    - **200 OK**: Returns data for category breakdown.

- **GET /api/charts/monthly-trends**: Retrieve monthly trends data.
  - **Response**: 
    - **200 OK**: Returns data for monthly trends.

(Will Add more API endpoint documentation here)
