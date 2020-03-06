<template>
  <div>
    <table>
      <tr>
        <th>称呼</th>
        <th>日期</th>
        <th>金额</th>
        <th>备注</th>
      </tr>
      <tr v-for="donor in donors">
        <th>{{donor.name || "佚名"}}</th>
        <th>{{donor.date}}</th>
        <th>{{donor.amount}}</th>
        <th>{{donor.t}}</th>
      </tr>
    </table>
  </div>
</template>
<script>
export default {
  data: () => {
    const dp = require("./donor-provider");
    return { donors: dp.getDonors() };
  },
  mounted: () => {}
};
</script>

<style scoped>
</style>