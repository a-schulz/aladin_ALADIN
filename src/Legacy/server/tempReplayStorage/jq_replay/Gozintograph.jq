.steps[] | select(.path == "taskData__adjacencyMatrix")
.steps[] | del(.value, .timestamp)