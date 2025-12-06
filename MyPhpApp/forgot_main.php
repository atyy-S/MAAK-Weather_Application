<?php
// forgot_main.php
session_start();
include 'includes/db_connection.php';

$message = '';
$isError = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if ($email === '') {
        $message = "Please enter your email.";
        $isError = true;
    } else {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        if ($stmt) {
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $stmt->store_result();

            if ($stmt->num_rows === 1) {
                $_SESSION['reset_email'] = $email;
                $stmt->close();
                header("Location: forget_reenter_pw.php"); // your real reset page
                exit;
            } else {
                $message = "Email not found.";
                $isError = true;
                $stmt->close();
            }
        } else {
            $message = "System error. Please try again later.";
            $isError = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>

    <link rel="stylesheet" href="assets/css/index.css"/>
    <link rel="stylesheet" href="assets/css/login.css"/>
    <link rel="stylesheet" href="assets/css/forget_main.css"/>
    <link href="https://cdn.boxicons.com/3.0.6/fonts/basic/boxicons.min.css" rel="stylesheet">

</head>
<body class="forgot-page">
    <div class="wrapper">
        <h1>Reset</h1>

        <?php
        if ($message !== '') {
            $class = $isError ? "error" : "success";
            echo '<p class="' . $class . '">' . htmlspecialchars($message) . '</p>';
        }
        ?>
        
        <form method="POST" action="forgot_main.php">
            <div class="input-box">
                <input type="email" name="email" placeholder="Enter your email" required>
                <i class="bxr bx-envelope bx-flip-horizontal"></i>
            </div>

            <div class="btn-box">
                <button type="submit">Check Email</button>
            </div>

            <div class="login-link">
                <p><a href="login.php">Back to Login</a></p>
            </div>
        </form>
    </div>
</body>
</html>
