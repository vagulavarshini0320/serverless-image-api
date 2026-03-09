# LinkedIn Post Draft

Use this draft for your LinkedIn post! I wrote it from your perspective so it sounds natural, like you just finished a weekend coding project.

---

I've been spending some time recently diving deeper into AWS, and I wanted to share a Serverless Image Processing API I just finished building! ☁️🚀

When it comes to web apps, handling large media uploads can quickly become a bottleneck. Directing large files through standard API endpoints runs the risk of hitting payload limits and driving up compute costs unnecessarily.

To solve this in my project, I decided to lean on **S3 Presigned URLs**. 

Here’s the architecture I went with:
1️⃣ The client requests a temporary, secure upload short-link from API Gateway / Lambda.
2️⃣ The client uploads the image *directly* to an S3 Raw Bucket, completely bypassing the API Gateway payload bottleneck.
3️⃣ This S3 upload triggers an async background Lambda function.
4️⃣ The function uses the `sharp` library to automatically resize the image and convert it to modern WebP format, saving it to a final Processed Bucket.

By making it fully Serverless, the infrastructure scales up when needed and scales to zero cost when idle! 💸

I wrote the entire Infrastructure-as-Code (IaC) configuration using the Serverless Framework and Node.js. 

I've open-sourced the code on my GitHub. Check out the repo below if you're interested in the setup! 

🔗 **GitHub Repo:** [Insert Your GitHub Link Here]

#aws #serverless #cloudcomputing #nodejs #softwareengineering #webdevelopment #opensource
