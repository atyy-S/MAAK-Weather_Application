<?php
session_start();
include 'includes/db_connection.php';

$message = '';

// Handle login form submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        $message = 'Email and password are required.';
    } else {
        // Find user by email
        $stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE email = ?");
        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows === 1) {
                $stmt->bind_result($id, $username, $password_hash);
                $stmt->fetch();

                // Check password (must be stored with password_hash in register)
                if (password_verify($password, $password_hash)) {

                    // Login success: set session
                    $_SESSION['user_id'] = $id;
                    $_SESSION['username'] = $username;

                    // Remember Me: set or clear cookie
                    if (!empty($_POST['remember'])) {
                        // store user ID for 30 days
                        setcookie(
                            'remember_user_id',
                            $id,
                            time() + (86400 * 30),  // 30 days
                            '/',
                            '',
                            false,
                            true
                        );
                    } else {
                        // clear cookie if it exists
                        setcookie('remember_user_id', '', time() - 3600, '/');
                    }

                    // Redirect to home page
                    header('Location: index.php');
                    exit;

                } else {
                    $message = 'Invalid email or password.';
                }
            } else {
                $message = 'Invalid email or password.';
            }

            $stmt->close();
        } else {
            $message = 'Database error: ' . $conn->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Weather by G3</title>

    <!-- Your styles -->
    <link rel="stylesheet" href="assets/css/index.css">
    <link rel="stylesheet" href="assets/css/login.css">

    <!-- Boxicons (for icons in inputs) -->
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body class="login-page">

<?php if ($message !== ''): ?>
    <p class="error-message" style="text-align:center; color:red;">
        <?php echo htmlspecialchars($message); ?>
    </p>
<?php endif; ?>

<div class="wrapper">
    <h1>Login</h1>

    <form action="login.php" method="POST">

        <!-- Email -->
        <div class="input-box">
            <input type="email" name="email" placeholder="Enter email" required>
            <i class="bx bx-envelope"></i>
        </div>

        <!-- Password -->
        <div class="input-box">
            <input type="password" name="password" placeholder="Enter password" required>
            <i class="bx bx-lock"></i>
        </div>

        <!-- Remember Me -->
        <div class="remember">
            <label>
                <input type="checkbox" name="remember">
                Remember Me
            </label>
        </div>

        <!-- Login Button -->
        <div class="btn-box">
            <button type="submit">Login</button>
        </div>

        <!-- Extra Links -->
        <div class="register-link">
            <p>Don't have an account? <a href="register.php">Register</a></p>
        </div>

        <div class="forgot-password">
            <a href="forgot_main.php">Forgot Password?</a>
        </div>
    </form>
</div>

</body>
</html>
