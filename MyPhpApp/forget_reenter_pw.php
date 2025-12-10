<?php
// forgot_reenter_pw.php
session_start();
include 'includes/db_connection.php';

// Make sure user came from forgot_main.php and we have their email
if (!isset($_SESSION['reset_email'])) {
    header('Location: forgot_main.php');
    exit;
}

$message = '';
$isError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newPassword = $_POST['password'] ?? '';
    $confirm     = $_POST['confirm_password'] ?? '';

    // 1. Required fields
    if ($newPassword === '' || $confirm === '') {
        $message = "All fields are required.";
        $isError = true;
    }
    // 2. Must match
    elseif ($newPassword !== $confirm) {
        $message = "Passwords do not match.";
        $isError = true;
    } else {
        // 3. Password complexity checks (same as register.php)
        $lenOK     = (strlen($newPassword) >= 8);
        $hasUpper  = preg_match('/[A-Z]/', $newPassword);
        $hasLower  = preg_match('/[a-z]/', $newPassword);
        $hasNumber = preg_match('/\d/',    $newPassword);

        if (!$lenOK && !$hasUpper && !$hasLower && !$hasNumber) {
            $message = "Password must be at least 8 characters long and include uppercase, lowercase, and a number.";
            $isError = true;
        } elseif (!$lenOK) {
            $message = "Password must be at least 8 characters long.";
            $isError = true;
        } elseif (!$hasUpper) {
            $message = "Password must include at least one uppercase letter.";
            $isError = true;
        } elseif (!$hasLower) {
            $message = "Password must include at least one lowercase letter.";
            $isError = true;
        } elseif (!$hasNumber) {
            $message = "Password must include at least one number.";
            $isError = true;
        } else {
            // 4. All good → hash & update in DB
            $hash  = password_hash($newPassword, PASSWORD_DEFAULT);
            $email = $_SESSION['reset_email'];

            $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
            if ($stmt) {
                $stmt->bind_param("ss", $hash, $email);
                if ($stmt->execute()) {
                    // Clear reset email from session
                    unset($_SESSION['reset_email']);

                    // One-time success message for login page
                    $_SESSION['reset_success'] = "Password successfully updated. You can now log in.";

                    // Redirect to Login screen
                    header('Location: login.php');
                    exit;
                } else {
                    $message = "Unable to reset password. Please try again.";
                    $isError = true;
                }
                $stmt->close();
            } else {
                $message = "System error. Please try again later.";
                $isError = true;
            }
        }
    }
}
?>




<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>

    <link rel="stylesheet" href="assets/css/index.css"/>
    <link rel="stylesheet" href="assets/css/login.css"/>
</head>
<body class="forget-page">
    <div class="wrapper">
         <?php
        if ($message !== '') {
            $class = $isError ? "error" : "success";
            echo '<p class="' . $class . '">' . htmlspecialchars($message) . '</p>';
        }
        ?>
        <h1>Reset Password</h1>

       

        <form method="POST" action="forget_reenter_pw.php">
            <div class="input-box">
                <input type="password" name="password" placeholder="New password" required>
            </div>

            <div class="input-box">
                <input type="password" name="confirm_password" placeholder="Confirm new password" required>
            </div>

            <div class="btn-box">
                <button type="submit">Reset Password</button>
            </div>

            <div class="login-link">
                <p><a href="login.php">Back to Login</a></p>
            </div>
            <!-- Back to Login as link -->
            <div class="login-link">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </div>
        </form>
    </div>
</body>
</html>
