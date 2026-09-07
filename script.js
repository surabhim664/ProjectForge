function scrollToGenerator() {
    document.getElementById("generator").scrollIntoView({
        behavior: "smooth"
    });
}

function scrollToFeatures() {
    document.getElementById("features").scrollIntoView({
        behavior: "smooth"
    });
}


function generateProject() {

    const ideaInput = document.getElementById("projectIdea");
    const idea = ideaInput.value.trim();

    if (idea === "") {
        alert("Please enter a project idea first!");
        return;
    }


    // ============================================
    // VARIABLES
    // ============================================

    let projectType = "general";

    let stack = [];
    let features = [];
    let tasks = [];

    let description = "";
    let architectureHTML = "";

    let complexityScore = 50;
    let complexityLevel = "Intermediate";
    let estimatedTime = "1–2 weeks";


    // ============================================
    // DETECT PROJECT TYPE
    // ============================================

    const lowerIdea = idea.toLowerCase();


    // AI PROJECT
    if (
        lowerIdea.includes("ai") ||
        lowerIdea.includes("artificial intelligence") ||
        lowerIdea.includes("machine learning") ||
        lowerIdea.includes("ml") ||
        lowerIdea.includes("prediction") ||
        lowerIdea.includes("chatbot")
    ) {

        projectType = "ai";

        stack = [
            "Python",
            "React",
            "Flask",
            "AI / ML",
            "MySQL"
        ];

        description =
            "An AI-powered application that uses intelligent models to analyze data, generate insights and provide useful predictions or recommendations.";


        features = [
            "AI-powered analysis",
            "Intelligent predictions",
            "Data processing",
            "User dashboard",
            "Automated recommendations"
        ];


        tasks = [
            "Set up project environment",
            "Prepare data pipeline",
            "Build AI module",
            "Create frontend dashboard",
            "Connect backend API",
            "Test AI predictions",
            "Deploy application"
        ];


        architectureHTML = `
            <div class="architecture-box">User</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">React Frontend</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Flask API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">AI Engine</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">MySQL Database</div>
        `;
    }


    // ATTENDANCE PROJECT
    else if (
        lowerIdea.includes("attendance") ||
        lowerIdea.includes("face recognition")
    ) {

        projectType = "attendance";

        stack = [
            "Python",
            "React",
            "Flask",
            "OpenCV",
            "MySQL"
        ];

        description =
            "A smart attendance management system that automates attendance using face recognition and provides dashboards and analytics for administrators.";


        features = [
            "Student registration",
            "Face recognition",
            "Automatic attendance",
            "Attendance dashboard",
            "Reports and analytics"
        ];


        tasks = [
            "Set up project environment",
            "Create student database",
            "Implement face recognition",
            "Build attendance engine",
            "Create admin dashboard",
            "Add reports and analytics",
            "Test and deploy"
        ];


        architectureHTML = `
            <div class="architecture-box">Student / Admin</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">React Dashboard</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Flask API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Face Recognition</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">MySQL Database</div>
        `;
    }


    // E-COMMERCE PROJECT
    else if (
        lowerIdea.includes("ecommerce") ||
        lowerIdea.includes("e-commerce") ||
        lowerIdea.includes("shopping") ||
        lowerIdea.includes("online store")
    ) {

        projectType = "ecommerce";

        stack = [
            "HTML",
            "CSS",
            "JavaScript",
            "Node.js",
            "MongoDB"
        ];

        description =
            "A modern e-commerce platform where users can browse products, manage their shopping cart, place orders and complete online payments.";


        features = [
            "Product catalog",
            "Shopping cart",
            "User authentication",
            "Order management",
            "Online payments"
        ];


        tasks = [
            "Set up project environment",
            "Create product database",
            "Build product pages",
            "Implement shopping cart",
            "Add user authentication",
            "Integrate payment system",
            "Test and deploy"
        ];


        architectureHTML = `
            <div class="architecture-box">Customer</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Web Store</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Node.js API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Payment Service</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">MongoDB Database</div>
        `;
    }


    // EDUCATION PROJECT
    else if (
        lowerIdea.includes("education") ||
        lowerIdea.includes("learning") ||
        lowerIdea.includes("course") ||
        lowerIdea.includes("e-learning") ||
        lowerIdea.includes("elearning")
    ) {

        projectType = "education";

        stack = [
            "React",
            "JavaScript",
            "Flask",
            "Python",
            "MySQL"
        ];

        description =
            "A digital learning platform that helps students access courses, track their progress and understand their learning performance through analytics.";


        features = [
            "Course management",
            "Video and content learning",
            "Progress tracking",
            "Student dashboard",
            "Learning analytics"
        ];


        tasks = [
            "Set up project environment",
            "Create course database",
            "Build course interface",
            "Add progress tracking",
            "Create student dashboard",
            "Add learning analytics",
            "Test and deploy"
        ];


        architectureHTML = `
            <div class="architecture-box">Student</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">React Learning Platform</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Flask API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Learning Engine</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">MySQL Database</div>
        `;
    }


    // HEALTHCARE PROJECT
    else if (
        lowerIdea.includes("health") ||
        lowerIdea.includes("healthcare") ||
        lowerIdea.includes("hospital") ||
        lowerIdea.includes("medical")
    ) {

        projectType = "healthcare";

        stack = [
            "React",
            "Python",
            "Flask",
            "PostgreSQL",
            "REST API"
        ];

        description =
            "A healthcare management platform designed to organize patient information, appointments, medical records and healthcare analytics.";


        features = [
            "Patient management",
            "Medical records",
            "Appointment scheduling",
            "Doctor dashboard",
            "Healthcare analytics"
        ];


        tasks = [
            "Set up project environment",
            "Design healthcare database",
            "Build patient management",
            "Create appointment system",
            "Build doctor dashboard",
            "Add analytics",
            "Test and deploy"
        ];


        architectureHTML = `
            <div class="architecture-box">Patient / Doctor</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">React Dashboard</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Flask API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Healthcare Services</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">PostgreSQL Database</div>
        `;
    }


    // GENERAL PROJECT
    else {

        projectType = "general";

        stack = [
            "HTML",
            "CSS",
            "JavaScript",
            "Flask",
            "MySQL"
        ];

        description =
            "A full-stack web application designed around the provided idea, with a modern user interface, backend services and structured data management.";


        features = [
            "User authentication",
            "Interactive dashboard",
            "Data management",
            "Search and filtering",
            "Analytics"
        ];


        tasks = [
            "Set up project environment",
            "Design application structure",
            "Build frontend interface",
            "Create backend API",
            "Connect database",
            "Add authentication",
            "Test and deploy"
        ];


        architectureHTML = `
            <div class="architecture-box">User</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">React Frontend</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">Flask API</div>
            <div class="arrow">↓</div>

            <div class="architecture-box">MySQL Database</div>
        `;
    }


    // ============================================
    // PROJECT TITLE
    // ============================================

    let title = idea;

    if (idea.length > 50) {
        title = idea.substring(0, 50) + "...";
    }

    document.getElementById("projectTitle").textContent = title;


    // ============================================
    // PROJECT DESCRIPTION
    // ============================================

    document.getElementById("overview").textContent = description;


    // ============================================
    // TECHNOLOGY STACK
    // ============================================

    const techStack = document.getElementById("techStack");

    techStack.innerHTML = "";

    stack.forEach(function (technology) {

        const tag = document.createElement("span");

        tag.textContent = technology;

        techStack.appendChild(tag);
    });


    // ============================================
    // FEATURES
    // ============================================

    const featuresList =
        document.getElementById("featuresList");

    featuresList.innerHTML = "";

    features.forEach(function (feature) {

        const item = document.createElement("span");

        item.textContent = "✓ " + feature;

        featuresList.appendChild(item);
    });


    // ============================================
    // DEVELOPMENT TASKS
    // ============================================

    const tasksList =
        document.getElementById("tasksList");

    tasksList.innerHTML = "";

    tasks.forEach(function (task, index) {

        const taskElement =
            document.createElement("div");

        taskElement.className = "task";

        taskElement.innerHTML = `
            <span class="task-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            ${task}
        `;

        tasksList.appendChild(taskElement);
    });


    // ============================================
    // ARCHITECTURE
    // ============================================

    const architecture =
        document.getElementById("architecture");

    architecture.innerHTML = architectureHTML;


    // ============================================
    // COMPLEXITY CALCULATION
    // ============================================

    let baseScore = 40;

    if (projectType === "ai") {
        baseScore = 60;
    }
    else if (projectType === "attendance") {
        baseScore = 55;
    }
    else if (projectType === "ecommerce") {
        baseScore = 50;
    }
    else if (projectType === "education") {
        baseScore = 45;
    }
    else if (projectType === "healthcare") {
        baseScore = 60;
    }


    complexityScore =
        baseScore +
        (features.length * 3) +
        (tasks.length * 2);


    if (complexityScore > 100) {
        complexityScore = 100;
    }


    // ============================================
    // COMPLEXITY LEVEL
    // ============================================

    if (complexityScore >= 80) {

        complexityLevel = "Advanced";

    }
    else if (complexityScore >= 60) {

        complexityLevel = "Intermediate";

    }
    else {

        complexityLevel = "Beginner";
    }


    // ============================================
    // ESTIMATED DEVELOPMENT TIME
    // ============================================

    if (complexityScore >= 80) {

        estimatedTime = "3–5 weeks";

    }
    else if (complexityScore >= 60) {

        estimatedTime = "2–3 weeks";

    }
    else {

        estimatedTime = "1–2 weeks";
    }


    // ============================================
    // DISPLAY COMPLEXITY
    // ============================================

    const complexityScoreElement =
        document.getElementById("complexityScore");

    const complexityLevelElement =
        document.getElementById("complexityLevel");

    const estimatedTimeElement =
        document.getElementById("estimatedTime");

    const complexityProgress =
        document.getElementById("complexityProgress");


    if (complexityScoreElement) {

        complexityScoreElement.textContent =
            complexityScore;
    }


    if (complexityLevelElement) {

        complexityLevelElement.textContent =
            complexityLevel;
    }


    if (estimatedTimeElement) {

        estimatedTimeElement.textContent =
            "Estimated development time: " +
            estimatedTime;
    }


    if (complexityProgress) {

        complexityProgress.style.width =
            complexityScore + "%";
    }


    // ============================================
    // SHOW BLUEPRINT
    // ============================================

    const blueprint =
        document.getElementById("blueprint");

    blueprint.style.display = "block";


    // Scroll to blueprint

    blueprint.scrollIntoView({
        behavior: "smooth"
    });
}