<template>
    <section class="section container">
        <h1 class="title is-1">Service Provider Addendum</h1>
        <h5 class="subtitle is-5">Latest update: March 20, 2022</h5>
<div class="content has-new-line">
by and between

you, as a user of the Opengrabs service
<ul><li>the Business -</li></ul>and

Opengrabs LLC
United States of America
legal representative, Giovanni La Perna
<ul><li>the Service Provider -</li></ul>
</div>
<h4 class="title is-4">Whereas</h4>
<div class="content has-new-line">
<ul>
<li>the business, or one of its subsidiaries or affiliates, has entered into one or more agreements (“Agreement”) with the Service Provider under which the Service Provider has agreed to provide the Service to the business;</li>
<li>the business and the Service Provider agree to enter into the present agreement, the terms of which are outlined below, to regulate the processing of the Personal Information shared by the business with the Service Provider for a business purpose;</li>
<li>this Service Provider Addendum forms an integral and substantial part of the Agreement and is effective on the date of signature of the Agreement.</li>
</ul>
Therefore, business and Service Provider agree as follows:

<ol>
    <li>Definitions. For purposes of this Addendum, the terms below shall only have the meanings set forth below. Capitalized terms used but not otherwise defined in this Addendum have the meanings set forth in the Agreement.
        <ol>
            <li>“CCPA” means the California Consumer Privacy Act of 2018.</li>
            <li>“Personal Information” means any “personal information” (as defined in the CCPA) contained within the data or set of data that the Service Provider “processes” (as defined in the CCPA) on behalf of the business (as defined in the CCPA) for a business purpose (as defined in the CCPA), in connection with performing Services under the Agreement.</li>
        </ol>
    </li>
    <li>Service Provider Obligations.
        <ol>
            <li>to the extent that the Service Provider processes the Personal Information on behalf of the business for a business purpose under the Agreement, it acts as “service provider” (as defined in the CCPA) and shall process the User Personal Information solely to provide its Services under the Agreement.</li>
            <li>the Service Provider shall not retain, use, disclose or otherwise process the Personal Information for any purpose other than for performing the Services, or as otherwise permitted by the CCPA, and shall return or delete all the Personal Information at the conclusion of performance of the Services, or sooner if so directed by the business.</li>
            <li>the Service Provider shall follow all the business's instructions regarding the return or destruction of the Personal Information.</li>
            <li>the Service Provider shall not “sell” (as defined in the CCPA) any of the User Personal Information.</li>
            <li>the Service Provider shall assist the business in fulfilling its obligations to respond to consumers (as defined under the CCPA) requests related to the Personal Information about them, including by promptly fulfilling requests to access or delete relevant Personal Information in Service Provider's possession.</li>
            <li>in particular, if the Service Provider receives a request to know or a request to delete from a consumer regarding Personal Information that the Service Provider collects, maintains, or otherwise processes on behalf of the business, and does not comply with the request, it shall explain the basis for the denial. The Service Provider shall also inform the consumer that it should submit the request directly to the business and, when feasible, provide the consumer with the relevant contact information.</li>
            <li>the Service Provider shall enter into written agreements with each third party subcontractor that processes the Personal Information that obligate the subcontractor to comply with terms that are at least as restrictive as those imposed on the Service Provider under this Addendum, including the prohibition on the sale of the Personal Information.</li>
        </ol>
    </li>
    <li>No Consideration.

Notwithstanding anything in the Agreement entered into between the Service Provider and the business, the Service Provider’s access to the Personal Information is not part of the consideration exchanged by the parties in respect of the Agreement.
</li>
<li>Duration of this Addendum.

Notwithstanding the expiration of the Agreement, this Addendum will remain in effect until, and automatically expire upon, Service Provider’s deletion or return of all the Personal Information to the business.
</li>
<li>Conflicts.

In the event of any conflict or inconsistency between this Addendum and the terms of the Agreement, this Addendum shall prevail, notwithstanding any statement to the contrary in the Agreement.
</li>
</ol>
</div>
    </section>   
</template>

<script>
export default {
    name: 'ServiceProviderAddendum',
    auth: false,
    head() {
        return {
            title: 'Service Provider Addendum'
        }
    },
}
</script>

<style scoped>
.has-new-line {
  white-space: pre-wrap;
}
ol {
  list-style-type: none;
  counter-reset: item;
  margin: 0;
  padding: 0;
}
ol > li {
  display: table;
  counter-increment: item;
  margin-bottom: 0.6em;
}
ol > li:before {
  content: counters(item, ".") ". ";
  display: table-cell;
  padding-right: 0.6em;    
}
li ol > li {
  margin: 0;
}
li ol > li:before {
  content: counters(item, ".") " ";
}
</style>