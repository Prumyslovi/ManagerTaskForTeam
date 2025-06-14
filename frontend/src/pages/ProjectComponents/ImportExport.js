import React from "react";
import * as XLSX from "xlsx";

const ImportExport = ({ data, setData, projectId, type = "kanban" }) => {
    const handleExportToExcel = () => {
        let worksheetData = [];
        const headers = [
            "ID",
            "Название",
            "Описание",
            "Статус",
            "Дата начала",
            "Дата окончания",
            "Ответственный"
        ];
        worksheetData.push(headers);

        if (type === "kanban") {
            Object.values(data.lanes || {}).forEach(lane => {
                lane.cards.forEach(card => {
                    worksheetData.push([
                        card.id || "",
                        card.title || "",
                        card.description || "",
                        lane.title || "",
                        formatDate(card.startDate) || "",
                        formatDate(card.endDate) || "",
                        card.assignee || ""
                    ]);
                });
            });
        } else if (type === "gantt") {
            const tasks = data.tasks || [];
            tasks.forEach(task => {
                worksheetData.push([
                    task.id || "",
                    task.text || "",
                    task.description || "",
                    task.status || "",
                    formatDate(task.start) || "",
                    formatDate(task.end) || "",
                    task.memberId || ""
                ]);
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        const sheetName = `${type}-board-${projectId.substring(0, 26)}`.slice(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${type}-board-${projectId.substring(0, 10)}.xlsx`);
    };

    const handleImportFromExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryString = event.target.result;
            const wb = XLSX.read(binaryString, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const headers = jsonData[0];
            const importedData = jsonData.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = row[index];
                });
                return item;
            });

            if (type === "kanban") {
                const lanes = {};
                importedData.forEach(item => {
                    const status = item["Статус"] || "В планах";
                    if (!lanes[status]) {
                        lanes[status] = {
                            id: `lane-${status}`,
                            title: status,
                            cards: []
                        };
                    }
                    lanes[status].cards.push({
                        id: item["ID"] || `Card${Date.now()}`,
                        title: item["Название"] || "",
                        description: item["Описание"] || "",
                        startDate: parseDate(item["Дата начала"]) || new Date().toISOString(),
                        endDate: parseDate(item["Дата окончания"]) || new Date().toISOString(),
                        assignee: item["Ответственный"] || ""
                    });
                });
                setData({ lanes });
            } else if (type === "gantt") {
                const tasks = importedData.map(item => ({
                    id: item["ID"] || "",
                    taskId: item["ID"] || "",
                    taskName: item["Название"] || "Без названия",
                    description: item["Описание"] || "",
                    startDate: parseDate(item["Дата начала"]) || new Date().toISOString(),
                    endDate: parseDate(item["Дата окончания"]) || new Date().toISOString(),
                    status: item["Статус"] || "",
                    memberId: item["Ответственный"] || "",
                    isDeleted: false
                }));
                setData({ tasks, links: [] });
            }
        };
        reader.readAsBinaryString(file);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString();
    };

    const parseDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split(".");
        return new Date(`${year}-${month}-${day}`).toISOString();
    };

    return (
        <div className="import-export">
            <button className="add-task-button" onClick={() => document.getElementById('import-file-input').click()}>
                Импорт
            </button>
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportFromExcel}
                style={{ display: 'none' }}
                id="import-file-input"
            />
            <button className="add-task-button" onClick={handleExportToExcel}>
                Экспорт
            </button>
        </div>
    );
};

export default ImportExport;