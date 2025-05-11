<template>
  <a-layout-footer class="app-footer">
    <div class="footer-container">
      <div class="footer-section">
        <h4>Intern Management System</h4>
        <p>A comprehensive platform for managing interns, mentors, and projects efficiently.</p>
      </div>
      
      <div class="footer-section">
        <h4>Quick Links</h4>
        <ul class="footer-links">
          <li><a href="#/dashboard">Dashboard</a></li>
          <li><a href="#/about">About Us</a></li>
          <li><a href="#/contact">Contact</a></li>
          <li><a href="#/help">Help & Support</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4>Connect With Us</h4>
        <div class="social-links">
          <a href="https://facebook.com" target="_blank" class="social-icon"><facebook-outlined /></a>
          <a href="https://linkedin.com" target="_blank" class="social-icon"><linkedin-outlined /></a>
          <a href="https://github.com" target="_blank" class="social-icon"><github-outlined /></a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>©2025 HAUI - Developed by Le Qui Long | All rights reserved</p>
    </div>
  </a-layout-footer>
</template>

<script setup>
import { FacebookOutlined, LinkedinOutlined, GithubOutlined } from '@ant-design/icons-vue';
</script>

<style scoped>
.app-footer {
  background-color: #001529;
  color: #fff;
  padding: 24px 16px;
  margin: 0;
  min-height: 200px;
}

.footer-container {
  max-width: 1200px;
  margin:  0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section {
  padding: 0 15px;
  margin-bottom: 20px;
  flex: 1;
  min-width: 250px;
}

.footer-section h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 16px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h4::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: #1890ff;
}

.footer-section p {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #1890ff;
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-icon {
  color: rgba(255, 255, 255, 0.65);
  font-size: 20px;
  transition: color 0.3s;
}

.social-icon:hover {
  color: #1890ff;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
  }
  
  .footer-section {
    width: 100%;
  }
}
</style>
