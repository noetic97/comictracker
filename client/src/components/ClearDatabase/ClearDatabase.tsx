import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "../shared/Button";
import { apiService } from "../../utils/apiService";

const ClearDatabase: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearDatabase = async () => {
    // First confirmation
    const firstConfirm = window.confirm(
      "⚠️ WARNING: This will delete ALL comics from the database!\n\nAre you sure you want to continue?"
    );

    if (!firstConfirm) return;

    // Second confirmation
    const secondConfirm = window.confirm(
      "🚨 FINAL WARNING: This action cannot be undone!\n\nType 'DELETE' in the next prompt to confirm."
    );

    if (!secondConfirm) return;

    // Third confirmation with text input
    const confirmText = window.prompt(
      "Type 'DELETE' to confirm (case sensitive):"
    );

    if (confirmText !== "DELETE") {
      alert("❌ Confirmation text incorrect. Operation cancelled.");
      return;
    }

    setIsClearing(true);

    try {
      console.log("🗑️ Clearing database...");

      const result = await apiService.admin.clearDatabase();

      console.log("✅ Database cleared:", result);
      alert(
        `✅ Success! Deleted ${result.deletedCount} comics from the database.`
      );

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error("❌ Failed to clear database:", error);
      alert(`❌ Failed to clear database: ${error.message}`);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      onClick={handleClearDatabase}
      icon={Trash2}
      variant="tertiary"
      disabled={isClearing}
      size="small"
    >
      {isClearing ? "Clearing..." : "Clear Database"}
    </Button>
  );
};

export default ClearDatabase;
