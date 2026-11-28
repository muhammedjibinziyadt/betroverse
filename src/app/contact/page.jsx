"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const prefillEmail = params.get("email");
      if (prefillEmail) setEmail(prefillEmail);
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service,
          message: "Submitted via contact page request form.",
        }),
      });

      const params = new URLSearchParams();
      params.append("First name", firstName.trim());
      params.append("Last name", lastName.trim());
      params.append("email", email.trim());
      params.append("phone", phone.trim());
      params.append("service", service);

      fetch(
        "https://script.google.com/macros/s/AKfycbz-YUhYE2JkkqDzCeNjkPikgvSRhwuxOz3PR_FHk-d1Zab_ki5Jnd6C2pIjRfwLOGSN/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      ).catch(() => {});

      alert("Form submitted successfully!");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setService("");
    } catch (err) {
      alert("Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Reserve Your Spot for Expert Digital Solutions</h1>
            <p>
              Get started with our professional digital services tailored to your
              business needs. Simply fill in your details, choose the service you
              want, and our team will connect with you shortly. Limited slots
              available, so don&apos;t wait!
            </p>
          </div>

          <div className="form-container">
            <div className="form-card" style={{ opacity: 1, transform: "none" }}>
              <form id="gform" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="First name"
                    className="form-input"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="Last name"
                    className="form-input"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Numner</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="Enter the number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobTitle">Services Title</label>
                  <select
                    id="jobTitle"
                    name="service"
                    className="form-input form-select"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    required
                  >
                    <option value="">Select your service</option>
                    <option value="Corporate Films">Corporate Films</option>
                    <option value="Brand Promotional Videos">
                      Brand Promotional Videos
                    </option>
                    <option value="Product Shoot Videos">
                      Product Shoot Videos
                    </option>
                    <option value="Social Media Content">
                      Social Media Content (Reels, Shorts)
                    </option>
                    <option value="Event Videography">Event Videography</option>
                    <option value="Client Testimonial Videos">
                      Client Testimonial Videos
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>

              <div className="form-footer">
                By registering, you agree to our <a href="#">Terms</a> and{" "}
                <a href="#">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
