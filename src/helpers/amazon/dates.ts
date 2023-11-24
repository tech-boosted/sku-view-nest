export const getPast30Days = () => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 30);
  const thirtyDaysAgoYear = currentDate.getFullYear();
  const thirtyDaysAgoMonth = String(currentDate.getMonth() + 1).padStart(
    2,
    '0',
  );
  const thirtyDaysAgoDay = String(currentDate.getDate()).padStart(2, '0');
  const thirtyDaysAgoFormatted = `${thirtyDaysAgoYear}-${thirtyDaysAgoMonth}-${thirtyDaysAgoDay}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayYear = yesterday.getFullYear();
  const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
  const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayFormatted = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

  return {
    yesterday: yesterdayFormatted,
    thirtyDaysAgo: thirtyDaysAgoFormatted,
  };
};

export const generatePast90DaysRanges = (): {
  start_date: string;
  end_date: string;
}[] => {
  const dateRanges = [];

  for (let i = 0; i < 3; i++) {
    const rangeEndDate = new Date(getYesterday());
    rangeEndDate.setDate(getYesterday().getDate() - i * 30);

    const rangeStartDate = new Date(rangeEndDate);
    rangeStartDate.setDate(rangeEndDate.getDate() - 30); // Adjusted to start from the next day

    // Format dates as strings in the desired format (YYYY-MM-DD)
    const formattedStartDate = formatDate(rangeStartDate);
    const formattedEndDate = formatDate(
      i === 0 ? getYesterday() : rangeEndDate,
    );

    // Create date range object
    const dateRange = {
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    };

    // Add the date range object to the array
    dateRanges.push(dateRange);
  }

  // Reverse the array to have the oldest date range first
  return dateRanges.reverse();
};

// Helper function to format dates as 'YYYY-MM-DD'
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to get yesterday's date
export function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}
