    const API_JOINED_URL = "http://localhost:3000/api/v1/projects?type=joined";

    async function fetchJoinedProjects(page = 1) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in first!");
        window.location.href = "login.html";
        return;
      }

      try {
        const response = await fetch(`${API_JOINED_URL}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const projects = await response.json();

        if (response.ok) {
          renderJoinedProjects(projects);
        } else {
          alert("Failed to fetch joined projects. Please try again.");
        }
      } catch (error) {
        alert("Error connecting to server.");
        console.error(error);
      }
    }

    function renderJoinedProjects(projects) {
        const tableBody = document.getElementById("joinedProjectsTable");
        tableBody.innerHTML = "";

        if (projects.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='2'>No joined projects found.</td></tr>";
            return;
        }

        projects.forEach((project) => {
            const row = `
            <tr>
              <td>${project.name}</td>
              <td>
                <button class="btn" onclick="viewTasks(${project.id}, '${project.name}')">View Tasks</button>
                <button class="delete btn" onclick="leaveProject(${project.id})">Leave</button>
              </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }

    async function viewTasks(projectId, projectName) {
      console.log("👀 View Tasks clicked! Project ID:", projectId);
      console.log("Fetching tasks for:", projectName);

      const token = localStorage.getItem("token");
      if (!token) {
          alert("You need to log in first!");
          return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/tasks`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("📦 API Response:", data); // ✅ Debugging

        const tasks = data.tasks || []; // ✅ Extract the tasks array
        console.log("✅ Extracted Tasks:", tasks);

        if (response.ok) {
            openTasksPopup(tasks, projectName);
            } else {
                alert("Failed to fetch tasks.");
            }
        } catch (error) {
            alert("Error connecting to server.");
            console.error(error);
        }
    }


    fetchJoinedProjects();

    async function leaveProject(projectId) {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You need to log in first!");
          window.location.href = "login.html";
          return;
        }

        if (!confirm("Are you sure you want to leave this project?")) {
          return;
        }

        try {
          const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/members/`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (response.ok) {
            alert("You have successfully left the project.");
            fetchJoinedProjects(); // Refresh the joined projects list
          } else {
            const errorData = await response.json();
            alert(`Failed to leave the project: ${errorData.error || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Error leaving project:", error);
          alert("Error connecting to server. Please try again later.");
        }
      }

    async function addProject() {
      // Get the project name from the input field
      const projectName = document.getElementById('projectName').value.trim();

      if (!projectName) {
        alert('Please enter a project name.');
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to log in first!");
        window.location.href = "login.html";
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/v1/projects", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project: {
              name: projectName
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(`Failed to add project: ${errorData.error || "Unknown error"}`);
          return;
        }

        const newProject = await response.json();
        alert(`Project "${newProject.name}" created successfully.`);

        // Clear the input field and potentially refresh the project list
        document.getElementById('projectName').value = '';
      } catch (error) {
        console.error("Error adding project:", error);
        alert("Error connecting to server. Please try again later.");
      }
    }

    const API_URL = "http://localhost:3000/api/v1/projects?type=owned";
    let currentPage = 1;

    async function fetchTasks(page = 1) {
      const token = localStorage.getItem("token");
      if (!token) {
          alert("You need to log in first!");
          window.location.href = "login.html";
          return;
      }

      try {
          const response = await fetch(`${API_URL}`, {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
          });

          const projects = await response.json();

          if (response.ok) {
              renderTasks(projects);
          } else {
              alert("Failed to fetch projects. Please try again.");
          }
      } catch (error) {
          alert("Error connecting to server.");
          console.error(error);
      }
    }

    function renderTasks(projects) {
        const tasksTable = document.getElementById("tasksTable");
        tasksTable.innerHTML = "";

        if (projects.length === 0) {
            tasksTable.innerHTML = "<tr><td colspan='2'>No projects found.</td></tr>";
            return;
        }

        projects.forEach((project) => {
            tasksTable.innerHTML += `
            <tr>
              <td>${project.name}</td>
              <td>
                <button class="btn" onclick="editProject(${project.id})">Edit</button>
                <button class="delete btn" onclick="deleteProject(${project.id})">Delete</button>
              </td>
            </tr>`;
        });
    }

    function editProject(projectId) {
        window.location.href = `edit-project.html?id=${projectId}`;
    }

    document.addEventListener("DOMContentLoaded", () => {
        fetchTasks(currentPage);
    });


    function updatePagination(meta) {
      document.getElementById("pagination").innerHTML = `
        <button class="btn" onclick="changePage(${meta.current_page - 1})" ${meta.current_page === 1 ? "disabled" : ""}>⬅ Previous</button>
        Page ${meta.current_page} of ${meta.total_pages}
        <button class="btn" onclick="changePage(${meta.current_page + 1})" ${meta.current_page === meta.total_pages ? "disabled" : ""}>Next ➡</button>
      `;
    }

    function changePage(page) {
      if (page > 0) {
        currentPage = page;
        fetchTasks(currentPage);
      }
    }

    function logout() {
      localStorage.removeItem("token");
      alert("Logged out successfully!");
      window.location.href = "login.html";
    }

    document.addEventListener("DOMContentLoaded", () => {
      fetchTasks(currentPage);
    });

    async function deleteProject(projectId) {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You need to log in first!");
          window.location.href = "login.html";
          return;
        }

        if (!confirm("Are you sure you want to delete this project?")) {
          return;
        }

        try {
          const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (response.ok) {
            alert("Project deleted successfully.");
            fetchTasks(currentPage); // Refresh the project list after deletion
          } else {
            const errorData = await response.json();
            alert(`Failed to delete project: ${errorData.error || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Error deleting project:", error);
          alert("Error connecting to server. Please try again later.");
        }
    }

    function openTasksPopup(tasks, projectId, projectName) {
        console.log("🚀 openTasksPopup is triggered!", tasks);

        document.getElementById("popupTitle").innerText = `Tasks for ${projectName}`;
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = "<tr><td colspan='2'>No tasks found.</td></tr>";
        } else {
            tasks.forEach(task => {
                const row = `
                <tr>
                  <td>${task.title} (${task.status})</td>
                  <td>
                    <button class="delete btn" onclick="removeTask(${task.id}, ${projectId})">Remove</button>
                  </td>
                </tr>`;
                taskList.innerHTML += row;
            });
        }

        document.getElementById("taskPopup").style.display = "block"; // ✅ Show pop-up
    }



    async function removeTask(taskId, projectId) { // ✅ Fix: Add projectId as a parameter
        if (!confirm("Are you sure you want to remove this task from your list?")) return;

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/tasks/${taskId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ task: { assignee_id: null } }) // ✅ Set assignee_id to null
            });

            if (response.ok) {
                alert("Task removed successfully!");
                viewTasks(projectId, document.getElementById("popupTitle").innerText); // Refresh tasks
            } else {
                alert("Failed to remove task.");
            }
        } catch (error) {
            alert("Error connecting to server.");
            console.error(error);
        }
    }


    async function viewTasks(projectId, projectName) {
    console.log("👀 View Tasks clicked! Project ID:", projectId);
    console.log("Fetching tasks for:", projectName);

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You need to log in first!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/v1/projects/${projectId}/tasks`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("📦 API Response:", data); // ✅ Debugging

        const tasks = data.tasks || []; // ✅ Extract the tasks array
        console.log("✅ Extracted Tasks:", tasks);

        if (response.ok) {
            openTasksPopup(tasks, projectId, projectName); // ✅ Ensure projectId is passed
        } else {
            alert("Failed to fetch tasks.");
        }
    } catch (error) {
        alert("Error connecting to server.");
        console.error(error);
    }
}


    function closeTasksPopup() {
        document.getElementById("taskPopup").style.display = "none"; // ✅ Hide pop-up
    }

