/**
 * Email service utility
 * In production, integrate with services like SendGrid, AWS SES, or Nodemailer
 */

/**
 * Send password reset email
 * This is a mock implementation - replace with actual email service
 */
export async function sendPasswordResetEmail(email, resetToken, firstName) {
  try {
    // In production, replace this with actual email service
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // Mock email sending - log to console for development
    console.log('=== PASSWORD RESET EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Your Password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('============================');

    // In production, implement actual email sending:
    /*
    const emailData = {
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    // Send email using your preferred service
    await emailService.send(emailData);
    */

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(email, verificationToken, firstName) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;

    // Mock email sending - log to console for development
    console.log('=== EMAIL VERIFICATION EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your Email`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('=================================');

    return { success: true };
  } catch (error) {
    console.error('Email verification sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(email, firstName) {
  try {
    // Mock email sending - log to console for development
    console.log('=== WELCOME EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to Our Platform!`);
    console.log(`Welcome ${firstName}!`);
    console.log('=====================');

    return { success: true };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(email, order) {
  try {
    const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}`;

    // Mock email sending - log to console for development
    console.log('=== ORDER CONFIRMATION EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Order Confirmation - ${order.orderNumber}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Total Amount: ₹${order.finalAmount.toFixed(2)}`);
    console.log(`Items: ${order.itemCount}`);
    console.log(`Order URL: ${orderUrl}`);
    console.log('================================');

    // In production, implement actual email sending:
    /*
    const emailData = {
      to: email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Order Confirmed!</h2>
          <p>Thank you for your order. Your order has been confirmed and will be processed soon.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹${order.finalAmount.toFixed(2)}</p>
          </div>

          <h3>Items Ordered</h3>
          <ul>
            ${order.items.map(item => `
              <li>${item.title} × ${item.quantity} - ₹${item.totalPrice.toFixed(2)}</li>
            `).join('')}
          </ul>

          <h3>Shipping Address</h3>
          <p>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine1}<br>
            ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br>
            Phone: ${order.shippingAddress.phone}
          </p>

          <div style="margin-top: 30px;">
            <a href="${orderUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Order Details
            </a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };
    
    // Send email using your preferred service
    await emailService.send(emailData);
    */

    return { success: true };
  } catch (error) {
    console.error('Order confirmation email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusUpdateEmail(email, order, newStatus) {
  try {
    const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}`;

    // Mock email sending - log to console for development
    console.log('=== ORDER STATUS UPDATE EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Order ${order.orderNumber} - Status Updated`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`New Status: ${newStatus}`);
    console.log(`Order URL: ${orderUrl}`);
    console.log('=================================');

    return { success: true };
  } catch (error) {
    console.error('Order status update email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order shipped email with tracking details
 */
export async function sendOrderShippedEmail(email, order) {
  try {
    const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}`;

    // Mock email sending - log to console for development
    console.log('=== ORDER SHIPPED EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Order ${order.orderNumber} - Shipped`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Tracking Number: ${order.trackingNumber}`);
    console.log(`Courier Partner: ${order.courierPartner}`);
    console.log(`Order URL: ${orderUrl}`);
    console.log('===========================');

    return { success: true };
  } catch (error) {
    console.error('Order shipped email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(email, order) {
  try {
    const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}`;

    // Mock email sending - log to console for development
    console.log('=== ORDER DELIVERED EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Order ${order.orderNumber} - Delivered`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Order URL: ${orderUrl}`);
    console.log('=============================');

    return { success: true };
  } catch (error) {
    console.error('Order delivered email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send enrollment confirmation email to student
 */
export async function sendEnrollmentConfirmationEmail(email, fullName, enrollmentId) {
  try {
    const enrollmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enroll/success?id=${enrollmentId}`;

    // Mock email sending - log to console for development
    console.log('=== ENROLLMENT CONFIRMATION EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Enrollment Confirmation`);
    console.log(`Student Name: ${fullName}`);
    console.log(`Enrollment ID: ${enrollmentId}`);
    console.log(`Enrollment URL: ${enrollmentUrl}`);
    console.log('======================================');

    // In production, implement actual email sending:
    /*
    const emailData = {
      to: email,
      subject: 'Enrollment Confirmation - Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Enrollment Confirmed!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for enrolling with us. We have received your enrollment application and it is currently under review.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Enrollment Details</h3>
            <p><strong>Enrollment ID:</strong> ${enrollmentId}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>

          <p>Our team will review your application and contact you within 2-3 business days.</p>

          <div style="margin-top: 30px;">
            <a href="${enrollmentUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Enrollment Status
            </a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };
    
    await emailService.send(emailData);
    */

    return { success: true };
  } catch (error) {
    console.error('Enrollment confirmation email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send enrollment notification to admin
 */
export async function sendEnrollmentNotificationToAdmin(enrollment) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const enrollmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/enrollments/${enrollment._id}`;

    // Mock email sending - log to console for development
    console.log('=== ENROLLMENT NOTIFICATION TO ADMIN ===');
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: New Enrollment Submission`);
    console.log(`Student Name: ${enrollment.fullName}`);
    console.log(`Email: ${enrollment.email}`);
    console.log(`Phone: ${enrollment.phone}`);
    console.log(`Enrollment ID: ${enrollment._id}`);
    console.log(`Enrollment URL: ${enrollmentUrl}`);
    console.log('========================================');

    return { success: true };
  } catch (error) {
    console.error('Admin enrollment notification sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send enrollment status update email to student
 */
export async function sendEnrollmentStatusUpdateEmail(email, fullName, newStatus) {
  try {
    const statusMessages = {
      'under_review': 'Your enrollment is currently under review',
      'approved': 'Congratulations! Your enrollment has been approved',
      'rejected': 'We regret to inform you that your enrollment has been rejected',
      'contacted': 'We have contacted you regarding your enrollment'
    };

    const message = statusMessages[newStatus] || 'Your enrollment status has been updated';

    // Mock email sending - log to console for development
    console.log('=== ENROLLMENT STATUS UPDATE EMAIL ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Enrollment Status Update`);
    console.log(`Student Name: ${fullName}`);
    console.log(`New Status: ${newStatus}`);
    console.log(`Message: ${message}`);
    console.log('======================================');

    // In production, implement actual email sending:
    /*
    const emailData = {
      to: email,
      subject: 'Enrollment Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Enrollment Status Update</h2>
          <p>Dear ${fullName},</p>
          <p>${message}</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Status Details</h3>
            <p><strong>Current Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Updated On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          ${newStatus === 'approved' ? `
            <p>You can now proceed with the next steps. Our team will contact you shortly with further instructions.</p>
          ` : ''}

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `
    };
    
    await emailService.send(emailData);
    */

    return { success: true };
  } catch (error) {
    console.error('Enrollment status update email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generic send email function for backward compatibility
 */
export async function sendEmail(to, subject, html) {
  try {
    // Mock email sending - log to console for development
    console.log('=== GENERIC EMAIL ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 100)}...`);
    console.log('=====================');

    return { success: true };
  } catch (error) {
    console.error('Generic email sending error:', error);
    return { success: false, error: error.message };
  }
}