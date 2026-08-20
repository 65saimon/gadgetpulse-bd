export interface DivisionData {
  name: string;
  districts: {
    name: string;
    upazilas: string[];
  }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    name: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        upazilas: ['Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Badda', 'Bashundhara', 'Khilgaon', 'Old Dhaka', 'Tejgaon', 'Savar', 'Keraniganj', 'Dhamrai'],
      },
      {
        name: 'Gazipur',
        upazilas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'],
      },
      {
        name: 'Narayanganj',
        upazilas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'],
      },
      {
        name: 'Tangail',
        upazilas: ['Tangail Sadar', 'Mirzapur', 'Madhupur', 'Ghatail', 'Gopalpur', 'Sakhipur', 'Kalihati'],
      },
      {
        name: 'Narsingdi',
        upazilas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura'],
      },
    ],
  },
  {
    name: 'Chattogram',
    districts: [
      {
        name: 'Chattogram',
        upazilas: ['Agrabad', 'GEC / Nasirabad', 'Khulshi', 'Panchlaish', 'Kotwali', 'Halishahar', 'Chawkbazar', 'Bakalia', 'Pahartali', 'Hathazari', 'Sitakunda', 'Patiya', 'Boalkhali'],
      },
      {
        name: 'Cox\'s Bazar',
        upazilas: ['Cox\'s Bazar Sadar', 'Ramu', 'Chakaria', 'Teknaf', 'Ukhiya', 'Maheshkhali'],
      },
      {
        name: 'Cumilla',
        upazilas: ['Cumilla Sadar', 'Laksam', 'Debidwar', 'Burichang', 'Chandina', 'Muradnagar', 'Daudkandi'],
      },
      {
        name: 'Noakhali',
        upazilas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh'],
      },
    ],
  },
  {
    name: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        upazilas: ['Zindabazar', 'Amberkhana', 'Shibgonj', 'Sylhet Sadar', 'Beanibazar', 'Golapganj', 'Biswanath', 'Fenchuganj', 'Zakiganj'],
      },
      {
        name: 'Moulvibazar',
        upazilas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Barlekha', 'Kamalganj'],
      },
      {
        name: 'Habiganj',
        upazilas: ['Habiganj Sadar', 'Madhabpur', 'Nabiganj', 'Bahubal', 'Chunarughat'],
      },
    ],
  },
  {
    name: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        upazilas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Paba', 'Godagari', 'Tanore', 'Bagha', 'Charghat'],
      },
      {
        name: 'Bogura',
        upazilas: ['Bogura Sadar', 'Sherpur', 'Shibganj', 'Dupchanchia', 'Gabtali', 'Kahaloo'],
      },
      {
        name: 'Pabna',
        upazilas: ['Pabna Sadar', 'Ishwardi', 'Bera', 'Santhia', 'Chatmohar', 'Atgharia'],
      },
    ],
  },
  {
    name: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        upazilas: ['Sonadanga', 'Khalishpur', 'Khulna Sadar', 'Daulatpur', 'Dumuria', 'Rupsha', 'Batiaghata'],
      },
      {
        name: 'Jashore',
        upazilas: ['Jashore Sadar', 'Jhikargachha', 'Sharsha', 'Benapole', 'Manirampur', 'Keshabpur'],
      },
      {
        name: 'Kushtia',
        upazilas: ['Kushtia Sadar', 'Kumarkhali', 'Mirpur', 'Bheramara', 'Khoksa', 'Daulatpur'],
      },
    ],
  },
  {
    name: 'Barishal',
    districts: [
      {
        name: 'Barishal',
        upazilas: ['Barishal Sadar', 'Kotwali', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gournadi', 'Mehendiganj'],
      },
      {
        name: 'Patuakhali',
        upazilas: ['Patuakhali Sadar', 'Kuakata', 'Galachipa', 'Kalapara', 'Bauphal'],
      },
    ],
  },
  {
    name: 'Rangpur',
    districts: [
      {
        name: 'Rangpur',
        upazilas: ['Rangpur Sadar', 'Pirganj', 'Badarganj', 'Mithapukur', 'Gangachara', 'Kaunia'],
      },
      {
        name: 'Dinajpur',
        upazilas: ['Dinajpur Sadar', 'Birganj', 'Parbatipur', 'Fulbari', 'Nawabganj'],
      },
    ],
  },
  {
    name: 'Mymensingh',
    districts: [
      {
        name: 'Mymensingh',
        upazilas: ['Mymensingh Sadar', 'Muktagachha', 'Trishal', 'Bhaluka', 'Fulbaria', 'Gafargaon', 'Ishwarganj'],
      },
      {
        name: 'Jamalpur',
        upazilas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Islampur', 'Dewanganj'],
      },
    ],
  },
];
