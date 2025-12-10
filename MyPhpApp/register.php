<?php
session_start();
include 'includes/db_connection.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Match your form field names
    $name       = trim($_POST['username'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $password   = $_POST['password'] ?? '';
    $confirm_pw = $_POST['confirm'] ?? '';

    // 1. Required fields
    if ($name === '' || $email === '' || $password === '' || $confirm_pw === '') {
        $message = "All fields are required.";
    }
    // 2. Passwords must match (Invalid Set 1)
    elseif ($password !== $confirm_pw) {
        $message = "Passwords do not match.";
    } else {
        // 3. Password complexity checks (FR-REGISTER-02 / FR-REGISTER-07)
        $lenOK     = (strlen($password) >= 8);
        $hasUpper  = preg_match('/[A-Z]/', $password);
        $hasLower  = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/\d/',    $password);

        // Combination case: short + missing all required types
        if (!$lenOK && !$hasUpper && !$hasLower && !$hasNumber) {
            $message = "Password must be at least 8 characters long and include uppercase, lowercase, and a number.";
        }
        // Too short
        elseif (!$lenOK) {
            $message = "Password must be at least 8 characters long.";
        }
        // Missing uppercase
        elseif (!$hasUpper) {
            $message = "Password must include at least one uppercase letter.";
        }
        // Missing lowercase
        elseif (!$hasLower) {
            $message = "Password must include at least one lowercase letter.";
        }
        // Missing number
        elseif (!$hasNumber) {
            $message = "Password must include at least one number.";
        }
        else {
            // 4. Check if email already exists (FR-REGISTER-04)
            $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
            if ($check) {
                $check->bind_param("s", $email);
                $check->execute();
                $check->store_result();

                if ($check->num_rows > 0) {
                    $message = "An account with this email already exists.";
                } else {
                    // 5. Email is unique → Insert user
                    $password_hash = password_hash($password, PASSWORD_DEFAULT);

                    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
                    if ($stmt) {
                        $stmt->bind_param("sss", $name, $email, $password_hash);

                        if ($stmt->execute()) {
                            // SUCCESS → redirect to Login
                            header("Location: login.php");
                            exit;
                        } else {
                            $message = "Error creating account. Please try again.";
                        }

                        $stmt->close();
                    } else {
                        $message = "Database error. Please try again later.";
                    }
                }

                $check->close();
            } else {
                $message = "Database error. Please try again later.";
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
    <title>Register - Weather by G3</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="assets/css/index.css"/>
    <link rel="stylesheet" href="assets/css/login.css"/>
    <link rel="stylesheet" href="assets/css/register.css"/>

    <!-- Boxicons (if you want to use them) -->
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body class="register-page">
    

    <div class="wrapper">
        <?php if ($message !== ''): ?>
       
        <p class="error-message" style="text-align:center; color:red;">
            <?php echo htmlspecialchars($message); ?>
        </p>
    <?php endif; ?>
        
        <h1>Register</h1>

        <form action="register.php" method="POST">

            <!-- Username -->
            <div class="input-box">
                <input type="text" id="username" name="username" placeholder="Enter username" required>
                <i class='bx bx-user bx-flip-horizontal'></i>
            </div>

            <!-- Email -->
            <div class="input-box">
                <input type="email" id="email" name="email" placeholder="Enter email" required>
                <i class='bx bx-envelope bx-flip-horizontal'></i>
            </div>
            

            <!-- Password -->
            <div class="input-box">
                <input type="password" id="password" name="password" placeholder="Enter password" required>
                <i class='bx bx-lock bx-flip-horizontal'></i>
            </div>

            <!-- Confirm Password -->
            <div class="input-box">
                <input type="password" id="confirm" name="confirm" placeholder="Confirm password" required>
                <i class='bx bx-lock bx-flip-horizontal'></i>
            </div>

            <!-- Register Button -->
            <div class="btn-box">
                <button type="submit">Register</button>
            </div>

            <!-- Back to Login as link -->
            <div class="login-link">
                <p>Already have an account? <a href="login.php">Login</a></p>
            </div>

        </form>
    </div>
    

</body>
</html>
