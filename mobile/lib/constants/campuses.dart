class Campus {
  final String code;
  final String name;
  final String state;

  const Campus({required this.code, required this.name, required this.state});
}

class NigerianCampuses {
  static const List<Campus> all = [
    Campus(code: 'EBSU', name: 'Ebonyi State University', state: 'Ebonyi'),
    Campus(code: 'UNN', name: 'University of Nigeria, Nsukka', state: 'Enugu'),
    Campus(code: 'UNILAG', name: 'University of Lagos', state: 'Lagos'),
    Campus(code: 'OAU', name: 'Obafemi Awolowo University', state: 'Osun'),
    Campus(code: 'UI', name: 'University of Ibadan', state: 'Oyo'),
    Campus(code: 'ABU', name: 'Ahmadu Bello University', state: 'Kaduna'),
    Campus(code: 'FUTO', name: 'Federal University of Technology Owerri', state: 'Imo'),
    Campus(code: 'ESUT', name: 'Enugu State Univ. of Science & Tech', state: 'Enugu'),
    Campus(code: 'IMSU', name: 'Imo State University', state: 'Imo'),
    Campus(code: 'DELSU', name: 'Delta State University', state: 'Delta'),
    Campus(code: 'UNIUYO', name: 'University of Uyo', state: 'Akwa Ibom'),
    Campus(code: 'UNIBEN', name: 'University of Benin', state: 'Edo'),
    Campus(code: 'UNIPORT', name: 'University of Port Harcourt', state: 'Rivers'),
    Campus(code: 'LASU', name: 'Lagos State University', state: 'Lagos'),
    Campus(code: 'OTHER', name: 'Other Nigerian University', state: 'Nigeria'),
  ];

  static const List<String> states = [
    'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
    'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  static const List<String> moodTags = [
    '🔥 Late Night Banter',
    '📚 Library Study Date',
    '💡 Intellectual Sparring',
    '☕ Midnight Coffee & Chill',
    '🎧 Afrobeats & Deep Talks',
    '🍿 Movie & Series Watch',
    '🚀 Building & Tech Talk',
    '🎨 Arts & Literature',
  ];
}
